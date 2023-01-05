(() => {
    ("use strict");

    kintone.events.on("app.record.index.show", (event) => {
        //ビュー名の一致で描画
        if (event.viewName === "【設定】") {
            let HTMLBody = "";
            const elm = document.getElementById("setting");

            //HTML初期表示
            HTMLBody += `
                        <div class="hide">
                            <input type="radio" class="tab-back" id="auto" name="tab-back" />
                            <input type="radio" class="tab-back" id="semi-auto" name="tab-back" />
                            <input type="radio" class="tab-back" id="manual" name="tab-back" />
                        </div>
                        <div class="tab">
                            <label for="auto" class="tab-label selectTab"><div class="tab-item">自動設定</div></label>
                            <label for="semi-auto" class="tab-label"><div class="tab-item">スペース指定</div></label>
                            <label for="manual" class="tab-label"><div class="tab-item">アプリ指定</div></label>
                        </div>
                        `;

            //初期は自動設定の項目を表示
            let configAreaBody = "";
            configAreaBody = geneAutoElm(configAreaBody);
            HTMLBody += `<div class="configArea">${configAreaBody}</div>`;

            //HTML生成
            elm.innerHTML = HTMLBody;

            //タブの切り替え→表示項目の切り替え（すべての要素にイベントを振る）
            if (document.getElementsByName("tab-back")) {
                for (item of Array.from(document.getElementsByName("tab-back"))) {
                    item.addEventListener("change", getConfigInfo);
                }
            }

            return event;
        }
    });

    /*==================================== 関数群 ====================================*/

    /**
     * 生成する設定の要素を抽出する関数
     * @returns
     */
    function getConfigInfo() {
        if (document.getElementsByName("tab-back")) {
            const elm = document.getElementById("setting");
            let configAreaBody = "";
            let targetTab;
            for (itemLabel of Array.from(document.getElementsByClassName("tab-label"))) {
                for (itemHide of Array.from(document.getElementsByName("tab-back"))) {
                    if (itemHide.checked) {
                        if (itemLabel.htmlFor === itemHide.id) {
                            targetTab = itemLabel.htmlFor;
                            //選択中表示
                            itemLabel.classList.add("selectTab");
                        }
                    } else {
                        if (itemLabel.htmlFor === itemHide.id) {
                            //選択外表示
                            itemLabel.classList.remove("selectTab");
                        }
                    }
                }
            }

            //タブによる表示の分岐
            switch (targetTab) {
                case "auto":
                    configAreaBody = geneAutoElm(configAreaBody);
                    break;
                case "semi-auto":
                    configAreaBody = geneSemiAutoElm(configAreaBody);
                    break;
                case "manual":
                    configAreaBody = geneManualElm(configAreaBody);
                    break;
                default:
                    console.log("対象外のタブを指定しています,作成者に確認してください");
                    return false;
            }

            //設定部分の書き換え
            const configArea = document.getElementsByClassName("configArea")[0];
            configArea.innerHTML = configAreaBody;
        }
    }

    /**
     * 自動設定の要素生成
     * @param {string} configAreaBody 生成するHTML
     * @returns {string} 要素追加済みHTML
     */
    function geneAutoElm(configAreaBody) {
        configAreaBody += `
                        <p>ボタンをクリックすることでアプリが作成され初期設定が完了します</p>
                        <p>※対象のスペース・アプリが存在する場合は直接入力の方法をとってください</p>
                        <button class="setting-button" id="auto-setting-button">自動設定開始</button>
                        `;
        return configAreaBody;
    }

    /**
     * スペース指定設定の要素生成
     * @param {string} configAreaBody 生成するHTML
     * @returns {string} 要素追加済みHTML
     */
    function geneSemiAutoElm(configAreaBody) {
        configAreaBody += `<p>スペース指定作成中</p>`;
        return configAreaBody;
    }

    /**
     * アプリ設定の要素生成
     * @param {string} configAreaBody 生成するHTML
     * @returns {string} 要素追加済みHTML
     */
    function geneManualElm(configAreaBody) {
        configAreaBody += `<p>アプリ設定作成中</p>`;
        return configAreaBody;
    }
})();
