from flask import render_template, jsonify
from flask import request
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import os

###########################################################
# Flaskオブジェクトの生成
###########################################################
app = Flask(__name__)
# # os.path.abspath は、指定された相対パスを絶対パスに変換する関数
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.abspath('data/define_table.db')}"
print(os.path.abspath('data/define_table.db'))
###########################################################
# DBインスタンスの生成
###########################################################
db = SQLAlchemy(app)
###########################################################
# t_polygon定義
###########################################################
class t_polygon(db.Model):
    id = db.Column(db.String, primary_key=True)
    nm = db.Column(db.String)
    color = db.Column(db.String)
    polygon = db.Column(db.Text)
    lat = db.Column(db.String)
    lon = db.Column(db.String)

    def __init__(self, id, nm, color, polygon, lat, lon):
        self.id=id
        self.nm=nm
        self.color=color
        self.polygon=polygon
        self.lat=lat
        self.lon=lon
###########################################################
# m_color定義
###########################################################
class m_color(db.Model):
    id = db.Column(db.String, primary_key=True)
    color = db.Column(db.String)

    def __init__(self, id, color):
        self.id=id
        self.color=color
###########################################################
# 指定ルートアクセス時の処理
###########################################################
@app.route('/')
def index():
    color = m_color.query.all()
    return render_template('index.html', color=color)

@app.route('/get_polygon')
def get_polygon():
    # DBからデータを取得
    poly = t_polygon.query.all()
    # 取得結果をlistへ格納
    coords = [[p.id, p.nm, p.color, p.polygon, p.lat, p.lon] for p in poly]
    # フロントエンドへ返却
    return jsonify({"data": coords})

@app.route('/color_change', methods=['POST'])
def color_change():
    # フロントからの取得値
    json_data = request.json
    # t_polygonを主キー検索
    t_poly = t_polygon.query.\
        filter(t_polygon.id==json_data["id"]).first()
    # 色更新
    t_poly.color = json_data["color"]
    # コミット
    db.session.commit()

    return json_data
###########################################################
# 本資材が直接実行された場合のみ、アプリケーションを起動する
###########################################################
if __name__ == '__main__':
    app.run(host='localhost', port=5000, debug=True)
