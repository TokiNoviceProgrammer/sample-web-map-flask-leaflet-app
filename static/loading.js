//////////////////////////////////////////
// 読み込み時実行
//////////////////////////////////////////
$(function () {
    // 地図生成
    makeMap();
    // 初回データ読み込み
    initRenderData();
    // 色選択値（初回）
    selectColor = $('#colorSelect option:selected').val();
    // 色選択値（変更時）
    $('#colorSelect').change(function () {
        let val = $('#colorSelect option:selected').val();
        selectColor = val;
    });
    // マーカー表示ボタン押下イベント
    $('#markerBtn').click(function (e) {
        if (!markerBtnFlg) {
            makeMarkerLayer();
            mymap.addLayer(markerLayer);
            markerBtnFlg = true;
        }
    });
    // 重心表示ボタン押下イベント
    $('#centerPointBtn').click(function (e) {
        if (!centerPointBtnFlg) {
            makeCenterPointLayer();
            mymap.addLayer(centerPointLayer);
            centerPointBtnFlg = true;
        }
    });
    // 訪問順表示ボタン押下イベント
    $('#polylineBtn').click(function (e) {
        if (!polylineBtnFlg) {
            makePolylineLayer();
            mymap.addLayer(polylineLayer);
            polylineBtnFlg = true;
        }
    });
    // 初期化ボタン押下イベント
    $('#initializeBtn').click(function (e) {
        initialize();
    });
})