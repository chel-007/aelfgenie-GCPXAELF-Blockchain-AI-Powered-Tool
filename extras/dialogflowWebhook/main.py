import re
import random
import json
from flask import Flask, request, jsonify

app = Flask(__name__)

# Load the dataset from a local file or Google Cloud Storage
with open('dataset.json') as f:
    dataset = json.load(f)

# Define a dictionary of contract types and their keywords
contract_keywords = {
    'TokenContract': ['token', 'tokens', 'erc20', 'fungible', 'currency'],
    'NFTContract': ['nft', 'nfts', 'non-fungible', 'collectible', 'art'],
    'DAOContract': ['dao', 'decentralized autonomous organization', 'governance'],
    'VotingContract': ['vote', 'election', 'poll', 'referendum'],
    'StakingContract': ['stake', 'staking', 'yield', 'reward', 'defi'],
    'MarketplaceContract': ['marketplace', 'market', 'trading'],
    'GameContract': ['game', 'gaming', 'play', 'gamify'],
    'StablecoinContract': ['stablecoin', 'stable', 'currency', 'pegged'],
    'LendingContract': ['lend', 'lending', 'borrow', 'borrowing'],
    'LiquidityPoolContract': ['liquidity', 'pool', 'liquidity pool'],
    'P2PContract': ['p2p', 'peer-to-peer', 'peer to peer'],
    'AuctionContract': ['auction', 'bid', 'bidding']
}

@app.route('/webhook', methods=['POST'])
def webhook(req):
    req = request.get_json()

    print("Incoming request:", req)
    user_description = req.get('text', '')

    # Analyze user description to find all relevant contract types
    detected_contract_types = []
    for ctype, keywords in contract_keywords.items():
        if any(re.search(r'\b' + re.escape(keyword) + r'\b', user_description, re.IGNORECASE) for keyword in keywords):
            detected_contract_types.append(ctype)

    # Limit to the first two detected contract types
    if len(detected_contract_types) > 2:
        detected_contract_types = detected_contract_types[:2]

    print(user_description)
    print(detected_contract_types)

    # Fetch feature suggestions based on detected contract types
    suggestions = []
    seen_features = set()
    
    if len(detected_contract_types) == 0:
        # Handle case when no specific contract type is found (general suggestion)
        general_contract = random.choice(dataset['contracts'])
        features = random.sample(general_contract['features'], 2)
        for feature in features:
            if feature['name'] not in seen_features:
                suggestions.append({'name': feature['name'], 'description': random.choice(feature['description'])})
                seen_features.add(feature['name'])
    elif len(detected_contract_types) == 1:
        ctype = detected_contract_types[0]
        for contract in dataset['contracts']:
            if contract['type'] == ctype:
                features = random.sample(contract['features'], 2)
                for feature in features:
                    if feature['name'] not in seen_features:
                        suggestions.append({'name': feature['name'], 'description': random.choice(feature['description'])})
                        seen_features.add(feature['name'])
                break
    else:
        for ctype in detected_contract_types:
            for contract in dataset['contracts']:
                if contract['type'] == ctype:
                    features = random.sample(contract['features'], 1)
                    for feature in features:
                        if feature['name'] not in seen_features:
                            suggestions.append({'name': feature['name'], 'description': random.choice(feature['description'])})
                            seen_features.add(feature['name'])
                    break

    response = {
        'fulfillmentResponse': {
            'messages': [
                {
                    'text': {
                        'text': [
                            'Here are some suggested features for your contract:'
                        ]
                    }
                }
            ] + [
                {
                    'text': {
                        'text': [
                            f"Feature: {feature['name']} - {feature['description']}"
                        ]
                    }
                }
                for feature in suggestions
            ]
        }
    }

    print(response)
    
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True)
