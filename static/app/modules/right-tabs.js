import { tpl, fnAlertMessage, fnCreateEditor } from "./lib.js"
import { fnCreateSpeadsheet } from "../app_spreadsheet.js"

export class RightTabs {
    static sURL = ``

    static oTabsNotesIndexes = {};
    static oTabsNotesIDs = {};
    static oTabsNotesNotSavedIDs = {};
    static oEditors = {};
    static oTabsTablesIndexes = {};
    static oTabsTablesIDs = {};
    static oTabsTablesNotSavedIDs = {};
    static oSpreadsheets = {};

    static oSelectedCell = null;
    static iSelectedRow = 0;
    static iSelectedColumn = 0;

    static oEvents = {
        tabs_save_content: "tabs:save_content",
        notes_item_click: "notes:item_click",
        fav_notes_item_click: "fav_notes:item_click",
        tags_item_click: "tags:item_click",
        tables_item_click: "tables:item_click",
    }

    static oURLs = {
        get_note: 'ajax.php?method=get_note',
        get_table: 'ajax.php?method=get_table',
        update_note_content: `ajax.php?method=update_note_content`,
        update_table_content: `ajax.php?method=update_table_content`,
    }

    static get oComponent() {
        return $("#notes-tt");
    }

    static get fnComponent() {
        return this.oComponent.tabs.bind(this.oComponent);
    }

    static fnGetNote(iID) {
        return $(`#note-${iID}`);
    }

    static fnGetTable(iID) {
        return $(`#table-${iID}`);
    }

    static fnBindEvents()
    {
        $(document).on(this.oEvents.notes_item_click, ((oEvent, oRow) => {
            this.fnActionOpenNote(oRow.id);
        }).bind(this));

        $(document).on(this.oEvents.fav_notes_item_click, ((oEvent, oRow) => {
            this.fnActionOpenNote(oRow.note_id);
        }).bind(this));

        $(document).on(this.oEvents.tables_item_click, ((oEvent, oRow) => {
            this.fnActionOpenTable(oRow.id);
        }).bind(this));

        $(document).on('keydown', (oEvent => {
            if (oEvent.ctrlKey && oEvent.key === 's') {
                oEvent.preventDefault();
                var iI = this.fnGetSelectedTabIndex();
                if (this.oTabsNotesIDs[iI]) {
                    this.fnFireEvent_TabSaveContent();
                    this.fnActionSaveNoteContent();
                }
                if (this.oTabsTablesIDs[iI]) {
                    this.fnFireEvent_TabSaveContent();
                    this.fnActionSaveTableContent();
                }
            }
        }).bind(this));

        document.body.addEventListener('paste', ((event) => {
            // console.log('paste');
            var iI = this.fnGetSelectedTabIndex();
            if (this.oTabsTablesIDs[iI]) {
                event.preventDefault();

                let paste = (event.clipboardData || window.clipboardData).getData('text');
                // console.log(['paste', paste]);

                var aLines = paste.split(/\n/);
                var oE = this.oSpreadsheets[this.oTabsTablesIDs[iI]].editor;

                for (var iR in aLines) {
                    var aCell = aLines[iR].split(/\t/);
                    for (var iC in aCell) {
                        oE.cellText(this.iSelectedRow*1 + iR*1, this.iSelectedColumn*1 + iC*1, aCell[iC]);
                    }
                }
                oE.reRender();
            }
        }).bind(this));
    }

    static fnFireEvent_TabSaveContent() {
        $(document).trigger(this.oEvents.tabs_save_content);
    }

    static fnInitComponent()
    {
        this.fnComponent({
            fit:true
        })
    }

    static fnGetSelected() {
        return this.fnComponent('getSelected');
    }

    static fnGetTabIndex(oTab) {
        return this.fnComponent('getTabIndex', oTab);
    }

    static fnGetSelectedTabIndex() {
        return this.fnComponent('getTabIndex', this.fnGetSelected());
    }

    static fnSelect(oTarget) {
        this.fnComponent('select', oTarget);
    }

    static fnAddTab(oOptions) {
        this.fnComponent('add', oOptions);
    }

    static fnGetTabTitle(iIndex) {
        return $(`.tabs .tabs-title[data-index='${iIndex}']`).text();
    }
    static fnSetTabTitle(iIndex, sTitle) {
        // var oTab = this.fnComponent('getTab', iIndex);
        // var iID = this.oTabsTablesIDs[iIndex]
        // console.log([iIndex, oTab, this.fnComponent]);

        $(`.tabs .tabs-title[data-index='${iIndex}']`).text(sTitle);
        
        // this.fnComponent('update', {
        //     tab: oTab,
        //     options: {
        //         title: sTitle,
        //         content: `<div id="table-${iID}"></div>`,
        //         closable: true,
        //     }
        // })
    }

    static fnAddTabTitleStar(iIndex) {
        var sTitle = this.fnGetTabTitle(iIndex);
        sTitle = `${sTitle} *`;
        this.fnSetTabTitle(iIndex, sTitle);
    }
    static fnRemoveTabTitleStar(iIndex) {
        var sTitle = this.fnGetTabTitle(iIndex);
        sTitle = sTitle.replace(/ \*$/, '');
        this.fnSetTabTitle(iIndex, sTitle);
    }

    static fnSetDirtyNote(iID) {
        if (this.oTabsNotesNotSavedIDs[iID]) return;
        this.fnAddTabTitleStar(this.oTabsNotesIndexes[iID]);
        this.oTabsNotesNotSavedIDs[iID] = true;
    }
    static fnUnsetDirtyNote(iID) {
        if (!this.oTabsNotesNotSavedIDs[iID]) return;
        this.fnRemoveTabTitleStar(this.oTabsNotesIndexes[iID]);
        this.oTabsNotesNotSavedIDs[iID] = false;
    }
    static fnSetDirtyTable(iID) {
        if (this.oTabsTablesNotSavedIDs[iID]) return;
        this.fnAddTabTitleStar(this.oTabsTablesIndexes[iID]);
        this.oTabsTablesNotSavedIDs[iID] = true;
    }
    static fnUnsetDirtyTable(iID) {
        if (!this.oTabsTablesNotSavedIDs[iID]) return;
        this.fnRemoveTabTitleStar(this.oTabsTablesIndexes[iID]);
        this.oTabsTablesNotSavedIDs[iID] = false;
    }

    static fnActionSaveNoteContent()
    {
        var iI = this.fnGetSelectedTabIndex();

        $.post(
            this.oURLs.update_note_content,
            {
                id: this.oTabsNotesIDs[iI],
                content: this.oEditors[this.oTabsNotesIDs[iI]].editor.value()
            }
        ).done((() => {
            this.fnUnsetDirtyNote(this.oTabsNotesIDs[iI]);
        }).bind(this))
    }

    static fnActionSaveTableContent()
    {
        var iI = this.fnGetSelectedTabIndex();

        $.post(
            this.oURLs.update_table_content,
            {
                id: this.oTabsTablesIDs[iI],
                content: JSON.stringify(this.oSpreadsheets[this.oTabsTablesIDs[iI]].editor.getData())
            }
        ).done((() => {
            this.fnUnsetDirtyTable(this.oTabsTablesIDs[iI]);
        }).bind(this))
    }

    static fnActionOpenNote(iID)
    {
        if (this.fnGetNote(iID).length) {
            this.fnSelect(this.oTabsNotesIndexes[iID]);
            return;
        }
        $.post(
            this.oURLs.get_note,
            { id: iID },
            ((oR) => {
                this.fnAddTab({
                    title: oR.name,
                    content: `<textarea id="note-${iID}" style="width:100%;height:100%"></textarea>`,
                    closable: true,
                });

                var iI = this.fnGetSelectedTabIndex();

                $(`.tabs .tabs-title:contains('${oR.name}')`).attr('data-index', iI);

                this.oTabsNotesIndexes[iID] = iI;
                this.oTabsNotesIDs[iI] = iID;

                this.oEditors[iID] = { editor: null, title: oR.name, id: iID };
                var oE = this.fnGetNote(iID);
                var sC = oR.content;

                var oEd = this.oEditors[iID].editor = fnCreateEditor(oE[0], sC);

                oEd.codemirror.on("change", (() => {
                    this.fnSetDirtyTable(this.oTabsNotesIDs[iI]);
                }).bind(this));
                
            }).bind(this),
            'json'
        );
    }

    static fnActionOpenTable(iID)
    {
        if (this.fnGetTable(iID).length) {
            this.fnSelect(this.oTabsTablesIndexes[iID]);
            return;
        }
        console.log('fnActionOpenTable');
        $.post(
            this.oURLs.get_table,
            { id: iID },
            ((oR) => {
                console.log('fnAddTab');
                this.fnAddTab({
                    title: oR.name,
                    content: `<div id="table-${iID}"></div>`,
                    closable: true,
                });

                var iI = this.fnGetSelectedTabIndex();

                $(`.tabs .tabs-title:contains('${oR.name}')`).attr('data-index', iI);

                this.oTabsTablesIndexes[iID] = iI;
                this.oTabsTablesIDs[iI] = iID;

                this.oSpreadsheets[iID] = { editor: null, title: oR.name, id: iID };
                var oData = JSON.parse(oR.content);

                var oEd = this.oSpreadsheets[iID].editor = fnCreateSpeadsheet(`table-${iID}`);
                oEd.loadData(oData);
                oEd.on('cell-selected', ((cell, ri, ci) => {
                    this.oSelectedCell = cell;
                    this.iSelectedRow = ri;
                    this.iSelectedColumn = ci;
                }).bind(this));
                oEd.change((() => {
                    this.fnSetDirtyTable(this.oTabsTablesIDs[iI]);
                }).bind(this))
            }).bind(this),
            'json'
        );
    }

    static fnPrepare()
    {
        this.fnBindEvents();
        this.fnInitComponent();
    }
}