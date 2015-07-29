# README

React.js + Rails の TODO デモアプリケーションです。

Facebook の flux-todomvc
https://github.com/facebook/flux/tree/master/examples/flux-todomvc
を参考にしました。

上記のサンプルでは、Store がオンメモリだったので、Ajax で Rails のバックエンドと通信して、データをデータベース(Sqlite3)に保存するようにしました。

実質、Facebook のサンプルに手を入れている部分は、public/js/stores/TodoStore.js だけです。

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
