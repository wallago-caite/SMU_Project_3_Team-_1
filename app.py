from flask import Flask, jsonify, render_template, redirect, url_for, request
from flask_sqlalchemy import SQLAlchemy
from src.app.vital_stats import action_card, make_overall_card_height, make_overall_card_weight, product_specific_card
from src.app.plot import generate_histogram
from src.app.db_operations import query_product_list, query_metrics
import plotly.io as pio
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

DB_USER = os.getenv('DB_USER')
DB_PASS = os.getenv('DB_PASS')
DB_HOST = os.getenv('DB_HOST')
DB_NAME = os.getenv('NEW_DB_NAME')
DB_PORT = os.getenv('DB_PORT')

db_url = f"postgresql+psycopg2://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = db_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# HTML Routes
@app.route('/')
def home():
    return redirect(url_for('action_page'))

@app.route('/butcher/action')
def action_page():
    return render_template('action.html')

@app.route('/butcher/overview')
def metrics():
    return render_template('overview.html')

@app.route('/butcher/products/')
def products():
    return render_template('products.html')

# API Routes for JS

# Action page data routes
@app.route('/data/action', methods=['GET'])
def action_data():
    return jsonify(action_card(db.engine))

# Overview page data routes
@app.route('/data/overview/weight', methods=['GET'])
def weight_overall_data():
    df = make_overall_card_weight(db.engine)
    return jsonify(df.to_dict(orient='records'))

@app.route('/data/overview/height', methods=['GET'])
def height_overall_data():
    df = make_overall_card_height(db.engine)
    return jsonify(df.to_dict(orient='records'))

# Product page data routes
@app.route('/data/products/plot/weight/<product_name>', methods=['GET'])
def product_weight_plot(product_name):
    from_date = request.args.get('from')
    to_date = request.args.get('to')
    plot = generate_histogram(product_name, db.engine, 'weight', from_date, to_date)
    plot_html = pio.to_html(plot, full_html=True, include_plotlyjs='cdn')
    return plot_html

@app.route('/data/products/plot/height/<product_name>', methods=['GET'])
def product_height_plot(product_name):
    from_date = request.args.get('from')
    to_date = request.args.get('to')
    plot = generate_histogram(product_name, db.engine, 'height', from_date, to_date)
    plot_html = pio.to_html(plot, full_html=True, include_plotlyjs='cdn')
    return plot_html

@app.route('/data/products/describe/weight/<product_name>', methods=['GET'])
def product_weight_description(product_name):
    from_date = request.args.get('from')
    to_date = request.args.get('to')
    df = product_specific_card(db.engine, product_name, 'weight', from_date, to_date)
    return jsonify(df.to_dict(orient='records'))

@app.route('/data/products/describe/height/<product_name>', methods=['GET'])
def product_height_description(product_name):
    from_date = request.args.get('from')
    to_date = request.args.get('to')
    df = product_specific_card(db.engine, product_name, 'height', from_date, to_date)
    return jsonify(df.to_dict(orient='records'))

@app.route('/data/products/list', methods=['GET'])
def get_unique_product_list():
    df = query_product_list(db.engine)
    return jsonify(df.to_dict(orient='records'))

if __name__ == '__main__':
    app.run()

