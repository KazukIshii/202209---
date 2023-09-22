/**
 * アプリの条件通知設定情報取得
 * @param {number | string} targetAppId 書き出し対象のアプリID
 * @param {string} targetAppName 書き出し対象のアプリ名
 * @param {number | string} configAppId 書き出し先のアプリID
 * @returns 書き出し用のbody
 */
async function appConditionNotificationConfigOutput(targetAppId, targetAppName, configAppId) {
  /*=== アプリの条件通知設定の取得 ===*/
  // アプリの条件通知設定の取得
  const getBody = {
    app: targetAppId,
  };
  const appConditionNotificationResp = await kintone.api(
    kintone.api.url("/k/v1/app/notifications/general.json", true),
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

  // 全アプリの条件通知の設定取得
  for (const [index, config] of appConditionNotificationResp.notifications.entries()) {
    // 1アプリのアクセス権単位の書き出し情報オブジェクト
    const postInfo = {};

    // アプリ名
    postInfo["アプリ名"] = { value: targetAppName };
    // アプリID
    postInfo["アプリID"] = { value: targetAppId };
    // バージョン
    postInfo["バージョン"] = { value: version };
    // 通知先タイプ
    postInfo["通知先タイプ"] = { value: config.entity.type };
    // 通知先コード
    postInfo["通知先コード"] = { value: config.entity.code };
    // 下位組織への通知
    postInfo["下位組織への通知"] = { value: config.includeSubs };
    // レコード追加の通知
    postInfo["レコード追加の通知"] = { value: config.recordAdded };
    // レコード編集の通知
    postInfo["レコード編集の通知"] = { value: config.recordEdited };
    // コメント書き込みの通知
    postInfo["コメント書き込みの通知"] = { value: config.commentAdded };
    // ステータス更新の通知
    postInfo["ステータス更新の通知"] = { value: config.statusChanged };
    // ファイル読込の通知
    postInfo["ファイル読込の通知"] = { value: config.fileImported };
    // コメント返信の通知
    postInfo["コメント返信の通知"] = { value: appConditionNotificationResp.notifyToCommenter };

    // アクセス権単位での情報をbodyに追加
    postBody.records.push(postInfo);
  }

  return postBody;
}

export { appConditionNotificationConfigOutput };
