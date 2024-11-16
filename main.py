import os
from dataclasses import dataclass

from dataclasses_json import dataclass_json
from flask import Flask, jsonify, render_template, request
from flask_sqlalchemy import SQLAlchemy
from marshmallow import ValidationError

###########################################################
# Flaskオブジェクトの生成
###########################################################
app = Flask(__name__)
# # os.path.abspath は、指定された相対パスを絶対パスに変換する関数
app.config["SQLALCHEMY_DATABASE_URI"] = (
    f"sqlite:///{os.path.abspath('data/define_table.db')}"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)


###########################################################
# データクラス定義
###########################################################
@dataclass_json(undefined="exclude")
@dataclass
class PolygonData:
    id: str  # ポリゴンの識別ID
    nm: str  # ポリゴンの名称
    color: str  # ポリゴンの色
    polygon: str  # GeoJSON形式のポリゴンデータ
    lat: str  # 重心の緯度
    lon: str  # 重心の経度


@dataclass_json(undefined="exclude")
@dataclass
class ColorData:
    id: str  # カラー識別ID
    color: str  # カラーコードまたは名称


###########################################################
# t_polygon定義
###########################################################
class PolygonModel(db.Model):
    __tablename__ = "t_polygon"
    id = db.Column(db.String, primary_key=True)
    nm = db.Column(db.String)
    color = db.Column(db.String)
    polygon = db.Column(db.Text)
    lat = db.Column(db.String)
    lon = db.Column(db.String)

    def to_dataclass(self) -> PolygonData:
        """
        SQLAlchemyモデルからデータクラスへの変換
        フロントエンドとのデータ送受信を明確に分離するために使用
        """
        return PolygonData(
            id=self.id,
            nm=self.nm,
            color=self.color,
            polygon=self.polygon,
            lat=self.lat,
            lon=self.lon,
        )


###########################################################
# m_color定義
###########################################################
class ColorModel(db.Model):
    __tablename__ = "m_color"
    id = db.Column(db.String, primary_key=True)
    color = db.Column(db.String)

    def to_dataclass(self) -> ColorData:
        """
        SQLAlchemyモデルからデータクラスへの変換
        """
        return ColorData(
            id=self.id,
            color=self.color,
        )


###########################################################
# 指定ルートアクセス時の処理
###########################################################
@app.route("/")
def index():
    # m_colorテーブルのデータを全取得してテンプレートに渡す
    color = ColorModel.query.all()
    # color_data = [color.to_dataclass().to_dict() for color in colors]
    return render_template("index.html", color=color)


###########################################################
# ポリゴンデータ取得API
###########################################################
@app.route("/get_polygon", methods=["GET"])
def get_polygon():
    # DBから全ポリゴンデータを取得
    polygons = PolygonModel.query.all()
    # データクラスに変換してJSON形式で返却
    data = [polygon.to_dataclass().to_dict() for polygon in polygons]
    return jsonify({"data": data})


###########################################################
# 色変更API
###########################################################
@app.route("/color_change", methods=["POST"])
def color_change():
    try:
        # フロントエンドから送信されたデータをバリデーションしつつ読み込む
        json_data = request.get_json()
        polygon_data = PolygonData.schema().load(json_data)

        # ポリゴンデータをDBから取得
        polygon = PolygonModel.query.filter_by(id=polygon_data.id).first()
        if not polygon:
            return jsonify({"error": "Polygon not found"}), 404

        # データの色を更新
        polygon.color = polygon_data.color
        db.session.commit()

        # 成功レスポンス
        return jsonify({"message": "Color updated successfully"}), 200
    except ValidationError as err:
        # バリデーションエラー時のレスポンス
        return jsonify({"error": err.messages}), 400


###########################################################
# 本資材が直接実行された場合のみ、アプリケーションを起動する
###########################################################
if __name__ == "__main__":
    app.run(host="localhost", port=5000, debug=True)
