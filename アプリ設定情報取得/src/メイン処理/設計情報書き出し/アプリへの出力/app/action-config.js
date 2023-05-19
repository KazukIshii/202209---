/**
 * アクション設定の書き出し
 * @param {number | string} targetAppId 書き出し対象のアプリID
 * @param {string} targetAppName 書き出し対象のアプリ名
 * @param {number | string} configAppId 書き出し先のアプリID
 * @returns リクエスト用のプロミスオブジェクト
 */
async function actionConfigOutput(targetAppId, targetAppName, configAppId) {
    /*=== アクション設定の取得 ===*/
    //アクション設定の取得
    const getBody = {
        app: targetAppId,
    };
    const actionResp = await kintone.api(kintone.api.url("/k/v1/app/actions.json", true), "GET", getBody);

    /*=== 書き出し用bodyの生成 ===*/
    //書き出し用のbody
    const postBody = {
        app: configAppId,
        records: [],
    };

    //バージョン情報の取得
    const query = `アプリID = "${targetAppId}" order by バージョン desc limit 1`;
    const versionResp = await kintone.api(kintone.api.url("/k/v1/records", true), "GET", { app: configAppId, query: query });
    let version;
    if (versionResp.records.length === 0) {
        //初回
        version = 1;
    } else {
        //2回目以降
        version = Number(versionResp.records[0].バージョン.value) + 1;
    }

    //全アクションの設定取得
    for (const config of Object.values(actionResp.actions)) {
        //1アクション単位の書き出し情報オブジェクト
        const postInfo = {};

        //アプリ名
        postInfo["アプリ名"] = { value: targetAppName };
        //アプリID
        postInfo["アプリID"] = { value: targetAppId };
        //バージョン
        postInfo["バージョン"] = { value: version };
        //アクション名
        postInfo["アクション名"] = { value: config.name };
        //アクションid
        postInfo["アクションID"] = { value: config.id };
        //アクションの並び順
        postInfo["アクションの並び順"] = { value: config.index };
        //コピー先アプリID
        postInfo["コピー先アプリID"] = { value: config.destApp.app };
        //コピー先アプリ名
        const appNameResp = await kintone.api(kintone.api.url("/k/v1/app.json", true), "GET", { id: config.destApp.app });
        postInfo["コピー先アプリ名"] = { value: appNameResp.name };
        //コピー先アプリコード
        postInfo["コピー先アプリコード"] = { value: config.destApp.code };

        //連携項目情報
        postInfo["連携項目情報"] = { value: [] };

        for (const mapping of config.mappings) {
            //1行単位の書き出し情報オブジェクト
            const rowInfo = { value: {} };

            //コピー元タイプ
            rowInfo.value["コピー元タイプ"] = { value: mapping.srcType };
            //コピー元フィールドコード
            if (mapping.srcType === "FIELD") {
                rowInfo.value["コピー元フィールドコード"] = { value: mapping.srcField };
            }
            //コピー先フィールドコード
            rowInfo.value["コピー先フィールドコード"] = { value: mapping.destField };

            //1行単位（1連携項目単位）での情報を連携項目情報に追加
            postInfo.連携項目情報.value.push(rowInfo);
        }

        //アクションの利用者情報
        postInfo["アクションの利用者情報"] = { value: [] };

        for (const entitie of config.entities) {
            //1行単位の書き出し情報オブジェクト
            const rowInfo = { value: {} };

            //利用者タイプ
            rowInfo.value["利用者タイプ"] = { value: entitie.type };
            //利用者コード
            rowInfo.value["利用者コード"] = { value: entitie.code };
            //利用者情報
            switch (entitie.type) {
                case "USER":
                    rowInfo.value["ユーザー"] = { value: [{ code: entitie.code }] };
                    break;
                case "GROUP":
                    rowInfo.value["グループ"] = { value: [{ code: entitie.code }] };
                    break;
                case "ORGANIZATION":
                    rowInfo.value["組織"] = { value: [{ code: entitie.code }] };
                    break;
                default:
                    break;
            }

            //1行単位（1連携項目単位）での情報をアクションの利用者情報に追加
            postInfo.アクションの利用者情報.value.push(rowInfo);
        }

        //アクション単位での情報をbodyに追加
        postBody.records.push(postInfo);
    }

    //リクエスト用のプロミスオブジェクト
    const promoiseObj = kintone.api(kintone.api.url("/k/v1/records", true), "POST", postBody);

    return promoiseObj;
}

export { actionConfigOutput };
