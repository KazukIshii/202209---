const path = require("path");

//!=== 必要に応じて変更を行ってください ===
const config = {
    //各ローダー等の設定
    module: {
        rules: [
            {
                //JSファイルの下位互換性
                test: /.js$/,
                use: [
                    {
                        loader: "babel-loader",
                        options: {
                            presets: ["@babel/preset-env"],
                        },
                    },
                ],
            },
            {
                //CSSファイルのバンドル
                test: /.css$/,
                use: ["style-loader", "css-loader"],
            },
            {
                //画像ファイルのバンドル
                test: /.(png|jpg|gif|svg)$/,
                type: "asset/inline",
            },
        ],
    },
};

//!=== 必要に応じて変更を行ってください ===
module.exports = (env) => {
    //バンドル対象の基準のファイル
    config["entry"] = path.resolve(env.path, "src\\index.js");
    //バンドル後のファイル名・出力先
    config["output"] = {
        filename: "main.js",
        clean: true,
    };

    //対象のモードを判定・設定
    const mode = env.mode;
    config["mode"] = mode;

    //ファイルサイズによる警告の非表示
    config["performance"] = { hints: false };

    //modeによる分岐
    switch (mode) {
        //本番用
        case "production":
            config["output"]["path"] = path.resolve(env.path, "dist\\prd");
            // config["devtool"] = "source-map";
            break;
        //開発用
        case "development":
            config["output"]["path"] = path.resolve(env.path, "dist\\dev");
            // config["devtool"] = "eval-source-map";
            break;
        //開発サーバーの利用
        case "server":
            config["mode"] = "development";
            config["output"]["path"] = path.resolve(env.path, "dist\\dev");
            // config["devtool"] = "eval-source-map";
            config["devServer"] = {
                //開く対象ファイルのパスを設定（html必須）
                static: {
                    directory: path.resolve(__dirname, "dist"),
                },
                //初回のバンドル時にブラウザでサーバーを自動的に開く設定
                open: true,
            };
            break;
        default:
            console.log("modeが選択されていません、設定を確認してください");
            return;
    }
    return config;
};
