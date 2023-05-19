/**
 * アプリのアクセス権設定の書き出し
 * @param {number | string} targetAppId 書き出し対象のアプリID
 * @param {string} targetAppName 書き出し対象のアプリ名
 * @param {number | string} configAppId 書き出し先のアプリID
 * @returns リクエスト用のプロミスオブジェクト
 */
async function appAccessPermissionConfigOutput(targetAppId, targetAppName, configAppId) {
    /*=== アプリのアクセス権設定の取得 ===*/
    //アプリのアクセス権設定の取得
    const getBody = {
        app: targetAppId,
    };
    const permissionResp = await kintone.api(kintone.api.url("/k/v1/app/acl.json", true), "GET", getBody);

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

    //全アプリのアクセス権の設定取得
    permissionResp.rights.forEach(async (config, index) => {
        //1アプリのアクセス権単位の書き出し情報オブジェクト
        const postInfo = {};

        //アプリ名
        postInfo["アプリ名"] = { value: targetAppName };
        //アプリID
        postInfo["アプリID"] = { value: targetAppId };
        //バージョン
        postInfo["バージョン"] = { value: version };
        //優先度
        postInfo["優先度"] = { value: index };
        //アクセス権対象タイプ
        postInfo["アクセス権対象タイプ"] = { value: config.entity.type };
        //アクセス権対象コード
        postInfo["アクセス権対象コード"] = { value: config.entity.code };
        //下位組織への継承
        postInfo["下位組織への継承"] = { value: `${config.includeSubs}` };
        //アプリ管理
        postInfo["アプリ管理"] = { value: `${config.appEditable}` };
        //レコード閲覧
        postInfo["レコード閲覧"] = { value: `${config.recordViewable}` };
        //レコード追加
        postInfo["レコード追加"] = { value: `${config.recordAddable}` };
        //レコード編集
        postInfo["レコード編集"] = { value: `${config.recordEditable}` };
        //レコード削除
        postInfo["レコード削除"] = { value: `${config.recordDeletable}` };
        //ファイル読み込み
        postInfo["ファイル読み込み"] = { value: `${config.recordImportable}` };
        //ファイル書き出し
        postInfo["ファイル書き出し"] = { value: `${config.recordExportable}` };

        //アクション単位での情報をbodyに追加
        postBody.records.push(postInfo);
    });

    //リクエスト用のプロミスオブジェクト
    const promoiseObj = kintone.api(kintone.api.url("/k/v1/records", true), "POST", postBody);

    return promoiseObj;
}

export { appAccessPermissionConfigOutput };
