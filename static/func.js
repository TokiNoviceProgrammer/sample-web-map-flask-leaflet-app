/**
 * 地図生成
 */
function makeMap() {
    // 地図を表示するdiv要素のidを設定
    // ズームコントロールを非表示で地図を作成する場合：「mymap = L.map('llmap', { zoomControl: false });」
    mymap = L.map('mymap');
    // 地図の中心とズームレベルを指定
    mymap.setView(BASECOORDS, 15.0);
    // 表示するタイルレイヤのURLとAttributionコントロールの記述を設定して、地図に追加する
    L.tileLayer(TILE_URL, { attribution: MB_ATTR }).addTo(mymap);
    // スケールコントロールを最大幅200px、右下、m単位で地図に追加
    L.control.scale({ maxWidth: 200, position: 'bottomright', imperial: false }).addTo(mymap);
    // ズームコントロールを左下で地図に追加
    // L.control.zoom({ position: 'bottomleft' }).addTo(mymap);
}

/**
 * 初回データ読み込み（ポリゴンの取得と取り込み）
 */
function initRenderData() {
    fetch("/get_polygon")
        .then((response) => {
            if (!response.ok) {
                throw new Error("Failed to fetch polygons");
            }
            return response.json();
        })
        .then((obj) => {
            polygonCenter = []; // ポリゴンの重心保持用リスト
            wktList = obj.data.map((item) => {
                const polygon = Polygon.fromJSON(item);
                polygonCenter.push([polygon.lat, polygon.lon]);

                return L.geoJson(wellknown.parse(polygon.polygon), {
                    id: polygon.id,
                    nm: polygon.name,
                    fillColor: polygon.color,
                    lat: polygon.lat,
                    lon: polygon.lon,
                    // polygonのスタイル
                    color: "black",
                    fill: true,
                    opacity: 1,
                    weight: 1,
                    fillOpacity: 0.6,
                    onEachFeature: onEachFeature,
                });
            });
        })
        .catch((error) => {
            console.error("Error during polygon data fetch:", error.message);
        })
        .finally(() => {
            // ポリゴンリストをレイヤーグループとして保持
            polygonLayer = L.layerGroup(wktList);
            // レイヤーグループを地図に設定
            mymap.addLayer(polygonLayer);
        });
}

/**
 * ポリゴン内イベント定義
 * @param {Object} feature - GeoJSON feature object
 * @param {L.Layer} layer - Leaflet layer object
 */
function onEachFeature(feature, layer) {
    //////////////////////////////////////////
    // クリック・ダブルクリック・マウスオーバー・マウスアウトのイベントを設定
    //////////////////////////////////////////
    layer.on({
        click: whenClick,
        dblclick: whenDblclick,
        mouseover: whenMouseover,
        mouseout: whenMouseout
    });
}

/**
 * クリックイベント
 * @param {L.LeafletMouseEvent} e - Leafletのマウスイベントオブジェクト
 */
function whenClick(e) {
    // ポリゴン色変更
    this.setStyle({
        fillColor: selectColor,
    });

    // クリックされたターゲットの区域情報を取得
    const target = e.target;
    const updateData = {
        id: target.defaultOptions.id,                       // ポリゴンID
        nm: target.defaultOptions.nm || "",                 // ポリゴン名
        color: selectColor,                                 // 更新後の色
        polygon: JSON.stringify(target.feature.geometry),   // ポリゴンのGeoJSON
        lat: target.defaultOptions.lat,                     // 重心の緯度
        lon: target.defaultOptions.lon,                     // 重心の経度
    };

    // サーバーに送信
    fetch("/color_change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Failed to update color");
            }
            return response.json();
        })
        .then(() => {
            console.log("色変更 成功");
        })
        .catch((error) => {
            console.error("色変更 失敗:", error.message);
        });
}

/**
 * ダブルクリックイベント
 * @param {L.LeafletMouseEvent} e - Leafletのマウスイベントオブジェクト
 */
function whenDblclick(e) {
    // 必要に応じて追加実装
}

/**
 * マウスオーバーイベント
 * @param {L.LeafletMouseEvent} e - Leafletのマウスイベントオブジェクト
 */
function whenMouseover(e) {
    // 現在の濃淡を取得
    beforeFillOpacity = e.target.defaultOptions.fillOpacity;
    // 濃淡変更
    this.setStyle({
        fillOpacity: 1.0,
    });
}

/**
 * マウスアウトイベント
 * @param {L.LeafletMouseEvent} e - Leafletのマウスイベントオブジェクト
 */
function whenMouseout(e) {
    // 濃淡変更
    this.setStyle({
        fillOpacity: beforeFillOpacity,
    });
}

/**
 * マーカーレイヤー作成
 */
function makeMarkerLayer() {
    const markerList = polygonCenter.map((c) => L.marker(c));
    markerLayer = L.layerGroup(markerList);
}

/**
 * 重心点レイヤー作成
 */
function makeCenterPointLayer() {
    const geojsonMarkerOptions = {
        radius: 3,
        fillColor: "black",
        color: "black",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8,
    };
    const centerPointList = polygonCenter.map((c) => L.circleMarker(c, geojsonMarkerOptions));
    centerPointLayer = L.layerGroup(centerPointList);
}

/**
 * 訪問順レイヤー作成
 */
function makePolylineLayer() {
    polylineLayer = L.polyline(polygonCenter, {
        color: "red",
        weight: 1,
        opacity: 0.8,
    });
}

/**
 * 初期化
 */
function initialize() {
    // ポリゴンレイヤー削除
    mymap.removeLayer(polygonLayer);
    // ポリゴンレイヤー再作成
    initRenderData();
    // マーカーレイヤー削除
    if (markerBtnFlg) {
        mymap.removeLayer(markerLayer);
        markerBtnFlg = false;
    }
    // 重心点レイヤー削除
    if (centerPointBtnFlg) {
        mymap.removeLayer(centerPointLayer);
        centerPointBtnFlg = false;
    }
    // 訪問順レイヤー削除
    if (polylineBtnFlg) {
        mymap.removeLayer(polylineLayer);
        polylineBtnFlg = false;
    }
}
