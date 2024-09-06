import pandas as pd

import main

# 内部資材
from main import app, db

with app.app_context():
    ###########################################################
    # delete
    ###########################################################
    db.session.query(main.t_polygon).delete()
    db.session.query(main.m_color).delete()
    ###########################################################
    # insert
    ###########################################################
    # t_polygon
    file_path = "data/t_polygon.csv"
    df = pd.read_csv(file_path, dtype=str)
    for i in range(len(df)):
        id = df.iloc[i, 0]  # 行iの0番目の列
        nm = df.iloc[i, 1]  # 行iの1番目の列
        color = df.iloc[i, 2]  # 行iの2番目の列
        polygon = df.iloc[i, 3]  # 行iの3番目の列
        lat = df.iloc[i, 4]  # 行iの4番目の列
        lon = df.iloc[i, 5]  # 行iの5番目の列
        # 登録データ作成
        row = main.t_polygon(id, nm, color, polygon, lat, lon)
        # 登録
        db.session.add(row)

    # m_color
    file_path = "data/m_color.csv"
    df = pd.read_csv(file_path, dtype=str)
    for i in range(len(df)):
        id = df.iloc[i, 0]  # 行iの0番目の列
        color = df.iloc[i, 1]  # 行iの1番目の列
        # 登録データ作成
        row = main.m_color(id, color)
        # 登録
        db.session.add(row)
    ###########################################################
    # コミット
    ###########################################################
    db.session.commit()
