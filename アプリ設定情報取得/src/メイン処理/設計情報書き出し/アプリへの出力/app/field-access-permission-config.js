/**
 * フィールドのアクセス権設定情報取得
 * @param {number | string} targetAppId 書き出し対象のアプリID
 * @param {string} targetAppName 書き出し対象のアプリ名
 * @param {number | string} configAppId 書き出し先のアプリID
 * @returns 書き出し用のbody
 */
async function fieldAccessPermissionConfigOutput(targetAppId, targetAppName, configAppId) {
  /*=== フィールドのアクセス権設定の取得 ===*/
  // フィールドのアクセス権設定の取得
  const getBody = {
    app: targetAppId,
  };
  const fieldAccessPermissionResp = await kintone.api(
    kintone.api.url("/k/v1/field/acl.json", true),
    "GET",
    getBody
  );

  /*=== 書き出し用bodyの生成 ===*/
  // 書き出し用のbody
  const postBody = {
    app: configAppId,
    records: [],
  };

  // バージョン情報の取得
  const query = `アプリID = "${targetAppId}" order by バージョン desc limit 1`;
  const versionResp = await kintone.api(kintone.api.url("/k/v1/records", true), "GET", {
    app: configAppId,
    query: query,
  });
  let version;
  if (versionResp.records.length === 0) {
    // 初回
    version = 1;
  } else {
    // 2回目以降
    version = Number(versionResp.records[0].バージョン.value) + 1;
  }

  // 全アプリのアクセス権の設定取得
  for (const field of fieldAccessPermissionResp.rights) {
    // フィールド単位
    for (const [index, config] of field.entities.entries()) {
      // 1アプリのアクセス権単位の書き出し情報オブジェクト
      const postInfo = {};

      // アプリ名
      postInfo["アプリ名"] = { value: targetAppName };
      // アプリID
      postInfo["アプリID"] = { value: targetAppId };
      // バージョン
      postInfo["バージョン"] = { value: version };
      // 優先度
      postInfo["優先度"] = { value: index };
      // 対象フィールド
      postInfo["対象フィールド"] = { value: field.code };
      // 可能な操作
      postInfo["可能な操作"] = { value: config.accessibility };
      // アクセス権対象タイプ
      postInfo["アクセス権対象タイプ"] = { value: config.entity.type };
      // アクセス権対象コード
      postInfo["アクセス権対象コード"] = { value: config.entity.code };
      // レコード編集の通知
      postInfo["レコード編集の通知"] = { value: config.recordEdited };
      // 下位組織への継承
      postInfo["下位組織への継承"] = { value: config.includeSubs };

      // アクセス権単位での情報をbodyに追加
      postBody.records.push(postInfo);
    }
  }

  return postBody;
}

export { fieldAccessPermissionConfigOutput };
