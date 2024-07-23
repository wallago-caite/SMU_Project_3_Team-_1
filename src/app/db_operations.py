import pandas as pd

def query_metrics(engine, product_name=None, from_date=None, to_date=None):
    if product_name:
        query = """
        SELECT *
        FROM metrics
        WHERE product_name = %(product_name)s
        """
        params = {'product_name': product_name}
    else:
        query = """
        SELECT *
        FROM metrics
        """
        params = {}

    if from_date and to_date:
        query += " AND date_time >= %(from_date)s AND date_time <= %(to_date)s"
        params['from_date'] = from_date
        params['to_date'] = to_date

    df = pd.read_sql(query, engine, params=params)
    return df

def query_specs(engine, product_name=None):
    if product_name:
        query = """
        SELECT *
        FROM products
        WHERE product_name = %(product_name)s;
        """
        df = pd.read_sql(query, engine, params={'product_name': product_name})
    else:
        query = """
        SELECT *
        FROM products;
        """
        df = pd.read_sql(query, engine)
        
    return df

def query_product_list(engine):
    query = """
    SELECT product_name
    FROM products;
    """
    df = pd.read_sql(query, engine)
    return df