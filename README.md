# Flux + React.js + Rails の TODO デモアプリ

Facebook の [flux-todomvc](https://github.com/facebook/flux/tree/master/examples/flux-todomvc) を参考にしました。

上記のサンプルでは、Store がオンメモリだったので、Ajax で Rails のバックエンドと通信して、データをデータベース(Sqlite3)に保存するようにしました。

実質、Facebook のサンプルに手を入れている部分は、public/js/stores/TodoStore.js だけです。

## 注意
現在、実装のわかりやすさを優先して CSRF からの保護を無効にしてあります。近々、CSRF 対策を行う予定。

## インストール方法

```
$ git clone git@github.com:elm200/todoapp.git
$ cd todoapp
$ rake db:migrate
$ cd public
$ npm install
$ cd ..
$ rails s
```

http://localhost:3000/ にアクセスすると、TODOアプリが起動します。
