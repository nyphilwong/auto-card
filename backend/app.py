from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity

app = Flask(__name__)
CORS(app)

# Configure the SQLite database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///auto_card.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'super-secret-key'  # Change this in production!

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

@app.route("/protected", methods=["GET"])
@jwt_required()
def protected():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if user:
        return jsonify({"message": f"Hello {user.email}, you are authenticated!"})
    else:
        return jsonify({"error": "User not found."}), 404

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

@app.route("/cards", methods=["GET"])
@jwt_required()
def get_cards():
    user_id = get_jwt_identity()
    cards = Card.query.filter_by(user_id=user_id).all()
    card_list = [{"id": c.id, "name": c.name, "last_four": c.last_four} for c in cards]
    return jsonify(card_list), 200

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


if __name__ == "__main__":
    with app.app_context():
        db.create_all()  # Creates tables if they don't exist
    app.run(debug=True)