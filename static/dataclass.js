/**
 * データクラスとしてのPolygon
 * データの構造を明確化し、型安全性を向上
 */
class Polygon {
    constructor(id, name, color, polygon, lat, lon) {
        this.id = id; // ポリゴンID
        this.name = name; // ポリゴンの名前
        this.color = color; // ポリゴンの色
        this.polygon = polygon; // GeoJSONデータ
        this.lat = lat; // 重心の緯度
        this.lon = lon; // 重心の経度
    }

    static fromJSON(json) {
        return new Polygon(json.id, json.nm, json.color, json.polygon, json.lat, json.lon);
    }
}