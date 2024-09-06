【Flask and Leaflet】sample web map application
=================

ライブラリーのインストール（実行前準備）:
「Pipfile」ファイルから仮想環境を構築（Windowsコマンドプロンプト）
```
set PIPENV_VENV_IN_PROJECT=1
set PIPENV_SKIP_LOCK=1
pipenv install
```
仮想環境をアクティブにする
```
.venv\Scripts\activate
```


テーブルの作成＆実行（初回実行時またはデータをcsvから再読み込みしたい場合のみ）:

```
run_and_make_data.bat
```

実行: 

```
run.bat
```
右記のurlにて起動確認ができる→ `http://localhost:5000`


データの確認: 

```
python all_select_table.py
```

デバック設定方法の参考: 

```
https://ohke.hateblo.jp/entry/2017/09/01/230000

```

leafletの参考:

```
https://ktgis.net/service/leafletlearn/index.html
```

SQLAlchemyの参考:

```
https://qiita.com/tomo0/items/a762b1bc0f192a55eae8
```

※仮想環境から出る
```
deactivate
```