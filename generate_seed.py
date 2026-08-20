import csv
import uuid
import sys

csv_file = "/Users/rafeysyed/Downloads/shein-products.csv"
sql_file = "/Users/rafeysyed/space/dev/projects/ecom-clone/springboot-microservices-saga/seed_products.sql"

def escape_sql(val):
    if val is None or val == "" or val == "null":
        return "NULL"
    val = str(val).replace("'", "''")
    return f"'{val}'"

def parse_num(val, default="NULL"):
    try:
        if val is None or val == "" or val == "null":
            return default
        return str(float(val))
    except:
        return default

def parse_int(val, default="NULL"):
    try:
        if val is None or val == "" or val == "null":
            return default
        return str(int(float(val)))
    except:
        return default

def parse_bool(val):
    if isinstance(val, str):
        return "TRUE" if val.strip().lower() in ("true", "1", "yes") else "FALSE"
    return "TRUE" if val else "FALSE"

count = 0
with open(csv_file, mode='r', encoding='utf-8') as f_in, open(sql_file, mode='w', encoding='utf-8') as f_out:
    reader = csv.DictReader(f_in)
    f_out.write("BEGIN;\n")
    for row in reader:
        p_id = f"'{uuid.uuid4()}'"
        name = escape_sql(row.get('product_name') or 'Unnamed Product')
        desc = escape_sql(row.get('description'))
        price = parse_num(row.get('final_price') or row.get('initial_price'), "0.0")
        initial_price = parse_num(row.get('initial_price'))
        currency = escape_sql(row.get('currency') or 'USD')
        in_stock = parse_bool(row.get('in_stock'))
        color = escape_sql(row.get('color'))
        size = escape_sql(row.get('size'))
        all_sizes = escape_sql(row.get('all_available_sizes'))
        main_img = escape_sql(row.get('main_image'))
        img_urls = escape_sql(row.get('image_urls'))
        rating = parse_num(row.get('rating'))
        reviews = parse_int(row.get('reviews_count'))
        brand = escape_sql(row.get('brand'))
        cat = escape_sql(row.get('category'))
        root_cat = escape_sql(row.get('root_category'))
        sku = escape_sql(row.get('product_id'))
        url = escape_sql(row.get('url'))

        f_out.write(
            f"INSERT INTO products (id, name, description, price, initial_price, currency, in_stock, color, size, all_available_sizes, main_image, image_urls, rating, reviews_count, brand, category, root_category, sku, url) "
            f"VALUES ({p_id}, {name}, {desc}, {price}, {initial_price}, {currency}, {in_stock}, {color}, {size}, {all_sizes}, {main_img}, {img_urls}, {rating}, {reviews}, {brand}, {cat}, {root_cat}, {sku}, {url});\n"
        )
        count += 1
    f_out.write("COMMIT;\n")

print(f"Generated {count} SQL inserts in {sql_file}")
