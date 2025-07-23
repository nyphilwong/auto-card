from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Configure the SQLite database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///auto_card.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

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

if __name__ == "__main__":
    with app.app_context():
        db.create_all()  # Creates tables if they don't exist
    app.run(debug=True)