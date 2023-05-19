import { constants, functions } from "./config";
import { kintoneConfigExport } from "./kitnone-config-export";

(async () => {
    //!入力部分はまだ確定していないので一旦保留、確定次第以下に入力受付部分の処理を記述、どの処理も基本的にボタン押下で発火するようにする
    /*============
    *　ここに記述
    =============*/
    const targetAppId = ""; //仮置き

    //アプリ名の取得→取得ボタン？を別途用意
    const tagetAppName = await functions.getAppName(targetAppId);
})();
