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
    // バックエンドへ非同期通信
    $.getJSON("/get_polygon", function (obj) {
        // ポリゴンの重心保持用リスト
        polygonCenter = []
        // ポリゴンをリストに詰める
        wktList = obj.data.map(function (arr) {
            // ポリゴンの重心を保持
            let lat = arr[4];
            let lon = arr[5];
            polygonCenter.push([lat, lon])
            // 取得データ分を変換・返却し、保持
            return L.geoJson(wellknown.parse(arr[3]), {
                id: arr[0],
                nm: arr[1],
                fillColor: arr[2],
                lat: lat,
                lon: lon,
                // polygonのスタイル
                color: "black",
                fill: true,
                opacity: 1,
                weight: 1,
                fillOpacity: 0.6,
                onEachFeature: onEachFeature
            });
        });
    }).always(function () {
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
        'fillColor': selectColor
    });
    // クリックされたターゲットの区域情報を取得
    let targetKuikiInfo = e.target;
    // 更新データ作成
    let id = targetKuikiInfo.defaultOptions.id;
    let color = selectColor;
    let updateData = { id: id, color: color };
    // JSON 形式への変換
    let updateDataJSON = JSON.stringify(updateData);
    // サーバーに送信
    $.ajax({
        type: "POST",
        url: "/color_change",
        data: updateDataJSON,
        contentType: "application/json",
        success: function () {
            console.log("色変更 成功");
        },
        error: function () {
            console.log("色変更 失敗");
        }
    });
}

/**
 * ダブルクリックイベント
 * @param {L.LeafletMouseEvent} e - Leafletのマウスイベントオブジェクト
 */
function whenDblclick(e) {
}

/**
 * マウスオーバーイベント
 * @param {L.LeafletMouseEvent} e - Leafletのマウスイベントオブジェクト
 */
function whenMouseover(e) {
    // 現在の濃淡を取得
    beforFillOpacity = e.target.defaultOptions.fillOpacity
    // 濃淡変更
    this.setStyle({
        'fillOpacity': 1.0
    });
}

/**
 * マウスアウトイベント
 * @param {L.LeafletMouseEvent} e - Leafletのマウスイベントオブジェクト
 */
function whenMouseout(e) {
    // 濃淡変更
    this.setStyle({
        'fillOpacity': beforFillOpacity
    });
}

/**
 * マーカーレイヤー作成
 */
function makeMarkerLayer() {
    var markerList = [];
    for (let c of polygonCenter) {
        marker = L.marker(c);
        markerList.push(marker);
    }
    markerLayer = L.layerGroup(markerList);
}

/**
 * 重心点レイヤー作成
 */
function makeCenterPointLayer() {
    var centerPointList = [];
    // 重心点の設定
    let geojsonMarkerOptions = {
        radius: 3,
        fillColor: "black",
        color: "black",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };
    for (let c of polygonCenter) {
        centerPoint = L.circleMarker(c, geojsonMarkerOptions);
        centerPointList.push(centerPoint);
    }
    centerPointLayer = L.layerGroup(centerPointList);
}

/**
 * 訪問順レイヤー作成
 */
function makePolylineLayer() {
    polylineLayer = L.polyline(
        polygonCenter,
        {
            "color": "red",
            "weight": 1,
            "opacity": 0.8
        })
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
        markerBtnFlg = false
    }
    // 重心点レイヤー削除
    if (centerPointBtnFlg) {
        mymap.removeLayer(centerPointLayer);
        centerPointBtnFlg = false
    }
    // 訪問順レイヤー削除
    if (polylineBtnFlg) {
        mymap.removeLayer(polylineLayer);
        polylineBtnFlg = false
    }
}
