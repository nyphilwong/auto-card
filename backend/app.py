from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import timedelta

app = Flask(__name__)
CORS(app)

# Configure the SQLite database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///auto_card.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'super-secret-key'  # Change this in production!
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)  # or longer for dev

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# Example User model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)  # We'll hash this later

# Example Card model
class Card(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(120), nullable=False)
    last_four = db.Column(db.String(4), nullable=True)
    reward_rules = db.relationship('RewardRule', backref='card', lazy=True)

# Example RewardRule model
class RewardRule(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    card_id = db.Column(db.Integer, db.ForeignKey('card.id'), nullable=False)
    category = db.Column(db.String(120), nullable=False)
    reward_type = db.Column(db.String(20), nullable=False)  # 'points' or 'cashback'
    reward_value = db.Column(db.Float, nullable=False)      # e.g., 1.5 for 1.5%

@app.route("/")
def home():
    return jsonify({"message": "Backend is running with SQLAlchemy!"})

@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 400
    hashed_pw = bcrypt.generate_password_hash(password).decode('utf-8')
    user = User(email=email, password=hashed_pw)
    db.session.add(user)
    db.session.commit()
    return jsonify({"message": "User registered successfully!"}), 201

# curl -X POST http://127.0.0.1:5000/register \                          
#   -H "Content-Type: application/json" \
#   -d '{"email":"test@example.com","password":"test123"}'

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    user = User.query.filter_by(email=email).first()
    if user and bcrypt.check_password_hash(user.password, password):
        access_token = create_access_token(identity=str(user.id))
        return jsonify({"access_token": access_token}), 200
    return jsonify({"error": "Invalid email or password"}), 401

# curl -X POST http://127.0.0.1:5000/login \ 
#   -H "Content-Type: application/json" \
#   -d '{"email":"test@example.com","password":"test123"}'

@app.route("/protected", methods=["GET"])
@jwt_required()
def protected():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if user:
        return jsonify({"message": f"Hello {user.email}, you are authenticated!"})
    else:
        return jsonify({"error": "User not found."}), 404

# curl -X GET http://127.0.0.1:5000/protected \
# > -H "Authorization: Bearer <access_token>"

@app.route("/delete_user", methods=["POST"])
def delete_user():
    data = request.get_json()
    email = data.get("email")
    user = User.query.filter_by(email=email).first()
    if user:
        db.session.delete(user)
        db.session.commit()
        return jsonify({"message": f"User {email} deleted."}), 200
    return jsonify({"error": "User not found."}), 404

# curl -X POST http://127.0.0.1:5000/delete_user \
#   -H "Content-Type: application/json" \
#   -d '{"email":"test@example.com"}'

@app.route("/cards", methods=["POST"])
@jwt_required()
def add_card():
    user_id = get_jwt_identity()
    data = request.get_json()
    name = data.get("name")
    last_four = data.get("last_four")
    if not name:
        return jsonify({"error": "Card name required"}), 400
    card = Card(user_id=user_id, name=name, last_four=last_four)
    db.session.add(card)
    db.session.commit()
    return jsonify({"message": "Card added!", "card_id": card.id}), 201

# curl -X POST http://127.0.0.1:5000/cards \
#   -H "Content-Type: application/json" \
#   -H "Authorization: Bearer <access_token>" \
#   -d '{"name":"Test Card","last_four":"1234"}'

@app.route("/cards", methods=["GET"])
@jwt_required()
def get_cards():
    user_id = get_jwt_identity()
    cards = Card.query.filter_by(user_id=user_id).all()
    card_list = [{"id": c.id, "name": c.name, "last_four": c.last_four} for c in cards]
    return jsonify(card_list), 200

# curl -X GET http://127.0.0.1:5000/cards \
#   -H "Authorization: Bearer <access_token>"

@app.route("/cards/<int:card_id>", methods=["DELETE"])
@jwt_required()
def delete_card(card_id):
    user_id = get_jwt_identity()
    card = Card.query.filter_by(id=card_id, user_id=user_id).first()
    if not card:
        return jsonify({"error": "Card not found"}), 404
    db.session.delete(card)
    db.session.commit()
    return jsonify({"message": "Card deleted"}), 200

@app.route("/reward_rules", methods=["POST"])
@jwt_required()
def add_reward_rule():
    user_id = get_jwt_identity()
    data = request.get_json()
    card_id = data.get("card_id")
    category = data.get("category")
    reward_type = data.get("reward_type")  # 'points' or 'cashback'
    reward_value = data.get("reward_value")
    # Check card ownership
    card = Card.query.filter_by(id=card_id, user_id=user_id).first()
    if not card:
        return jsonify({"error": "Card not found or not owned by user"}), 404
    if not category or not reward_type or reward_value is None:
        return jsonify({"error": "Missing required fields"}), 400
    rule = RewardRule(card_id=card_id, category=category, reward_type=reward_type, reward_value=reward_value)
    db.session.add(rule)
    db.session.commit()
    return jsonify({"message": "Reward rule added!", "rule_id": rule.id}), 201

@app.route("/cards/<int:card_id>/reward_rules", methods=["GET"])
@jwt_required()
def get_reward_rules(card_id):
    user_id = get_jwt_identity()
    card = Card.query.filter_by(id=card_id, user_id=user_id).first()
    if not card:
        return jsonify({"error": "Card not found or not owned by user"}), 404
    rules = RewardRule.query.filter_by(card_id=card_id).all()
    rule_list = [{
        "id": r.id,
        "category": r.category,
        "reward_type": r.reward_type,
        "reward_value": r.reward_value
    } for r in rules]
    return jsonify(rule_list), 200

@app.route("/reward_rules/<int:rule_id>", methods=["DELETE"])
@jwt_required()
def delete_reward_rule(rule_id):
    user_id = get_jwt_identity()
    rule = RewardRule.query.get(rule_id)
    if not rule:
        return jsonify({"error": "Reward rule not found"}), 404
    
    card = Card.query.filter_by(id=rule.card_id, user_id=user_id).first()
    if not card:
        return jsonify({"error": "Unauthorized to delete this reward rule"}), 403

    db.session.delete(rule)
    db.session.commit()
    return jsonify({"message": "Reward rule deleted"}), 200

@app.route("/recommend_card", methods=["POST"])
@jwt_required()
def recommend_card():
    user_id = get_jwt_identity()
    data = request.get_json()
    category = data.get("category")
    amount = data.get("amount")
    if not category or amount is None:
        return jsonify({"error": "Category and amount required"}), 400
    cards = Card.query.filter_by(user_id=user_id).all()
    best_card = None
    best_reward = 0
    best_type = None
    for card in cards:
        # Find the best matching rule for this card
        rule = RewardRule.query.filter_by(card_id=card.id, category=category).first()
        if rule:
            reward = rule.reward_value
            reward_type = rule.reward_type
        else:
            # Default: 1x points or 1% cashback if no rule
            reward = 1.0
            reward_type = 'points'
        # For now, treat points and cashback equally (can be improved)
        if reward > best_reward:
            best_reward = reward
            best_card = card
            best_type = reward_type
    if not best_card:
        return jsonify({"error": "No cards found"}), 404
    return jsonify({
        "card_id": best_card.id,
        "name": best_card.name,
        "last_four": best_card.last_four,
        "reward_type": best_type,
        "reward_value": best_reward
    }), 200
    
# curl -X POST http://127.0.0.1:5000/recommend_card \
#   -H "Content-Type: application/json" \
#   -H "Authorization: Bearer <access_token>" \
#   -d '{"category": "dining", "amount": 100}'

if __name__ == "__main__":
    with app.app_context():
        db.create_all()  # Creates tables if they don't exist
    app.run(debug=True)