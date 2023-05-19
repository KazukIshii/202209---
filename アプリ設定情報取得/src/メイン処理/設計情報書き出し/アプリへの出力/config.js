/*=========
*   定数
==========*/
const constants = {};

/*=========
*   関数
==========*/
const functions = {
    /**
     * アプリ名の取得
     * @param {number | string} appId アプリID
     * @returns アプリ名
     */
    getAppName: async (appId) => {
        const resp = await kintone.api(kintone.api.url("/k/v1/app.json", true), "GET", { id: appId });
        return resp.name;
    },
};

export { constants, functions };
