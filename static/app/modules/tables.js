import { tpl, fnAlertMessage } from "./lib.js"

export class Tables {
    static sURL = ``

    static oURLs = {
        create: 'ajax.php?method=create_table',
        update: tpl`ajax.php?method=update_table&id=${0}`,
        delete: 'ajax.php?method=delete_table',
        list: tpl`ajax.php?method=list_tables&category_id=${0}`,
    }
    static oWindowTitles = {
        create: 'Новая таблица',
        update: 'Редактировать таблицу'
    }
    static oEvents = {
        tables_save: "tables:save",
        tables_item_click: "tables:item_click",
        tables_category_select: 'tables_category:select',
    }

    static get oDialog() {
        return $('#tables-dlg');
    }
    static get oDialogForm() {
        return $('#tables-dlg-fm');
    }
    static get oComponent() {
        return $("#tables-list");
    }
    static get oContextMenu() {
        return $("#tables-mm");
    }

    static get oCategoryIDComboTree() {
        return $('#tables-dlg-category_id-combotree');
    }
    static get oTagsTagBox() {
        return $('#tables-tags-box');
    }

    static get oEditDialogSaveBtn() {
        return $('#tables-dlg-save-btn');
    }
    static get oEditDialogCancelBtn() {
        return $('#tables-dlg-cancel-btn');
    }

    static get oPanelAddButton() {
        return $('#tables-list-add-btn');
    }
    static get oPanelEditButton() {
        return $('#tables-list-edit-btn');
    }
    static get oPanelRemoveButton() {
        return $('#tables-list-remove-btn');
    }
    static get oPanelReloadButton() {
        return $('#tables-list-reload-btn');
    }


    static get fnComponent() {
        return this.oComponent.datalist.bind(this.oComponent);
    }

    static fnShowDialog(sTitle) {
        this.oDialog.dialog('open').dialog('center').dialog('setTitle', sTitle);
    }
    static fnDialogFormLoad(oRows={}) {
        this.oCategoryIDComboTree.combotree('reload');
        this.oDialogForm.form('clear');
        this.oDialogForm.form('load', oRows);
    }

    static fnShowCreateWindow() {
        this.sURL = this.oURLs.create;
        var oData = {}
        this.fnShowDialog(this.oWindowTitles.create);
        this.fnDialogFormLoad(oData);
    }

    static fnShowEditWindow(oRow) {
        if (oRow) {
            this.sURL = this.oURLs.update(oRow.id);
            this.fnShowDialog(this.oWindowTitles.update);
            this.fnDialogFormLoad(oRow);
        }
    }

    static fnReload() {
        this.fnComponent('reload');
    }

    static fnSave() {
        this.oDialogForm.form('submit', {
            url: this.sURL,
            queryParams: {
                'tags_list': this.oTagsTagBox.combotree('getValues').join(',')
            },
            iframe: false,
            onSubmit: function(){
                return $(this).form('validate');
            },
            success: (function(result){
                this.oDialog.dialog('close');
                this.fnReload();

                this.fnFireEvent_Save();
            }).bind(this)
        });
    }

    static fnDelete(oRow) {
        if (oRow){
            $.messager.confirm(
                'Confirm',
                'Удалить?',
                (function(r) {
                    if (r) {
                        $.post(
                            this.oURLs.delete,
                            { id: oRow.id },
                            (function(result) {
                                this.fnReload();
                            }).bind(this),
                            'json'
                        );
                    }
                }).bind(this)
            );
        }
    }

    static fnGetSelected() {
        return this.fnComponent('getSelected');
    }

    static fnSelect(oTarget) {
        this.fnComponent('select', oTarget);
    }

    static fnBindEvents()
    {
        $(document).on(this.oEvents.tables_category_select, ((oEvent, oItem) => {
            this.fnInitComponent(oItem.id);
        }).bind(this))

        this.oEditDialogSaveBtn.click((() => {
            this.fnSave();
        }).bind(this))
        this.oEditDialogCancelBtn.click((() => {
            this.oDialog.dialog('close');
        }).bind(this))

        this.oPanelAddButton.click((() => {
            this.fnShowCreateWindow();
        }).bind(this))
        this.oPanelEditButton.click((() => {
            this.fnShowEditWindow(this.fnGetSelected());
        }).bind(this))
        this.oPanelRemoveButton.click((() => {
            this.fnDelete(this.fnGetSelected());
        }).bind(this))
        this.oPanelReloadButton.click((() => {
            this.fnReload();
        }).bind(this))
    }

    static fnFireEvent_Save() {
        $(document).trigger(this.oEvents.tables_save);
    }

    static fnFireEvent_ItemClick(oRow) {
        $(document).trigger(this.oEvents.tables_item_click, [ oRow ]);
    }

    static fnInitComponent(iID)
    {
        this.fnComponent({
            url: this.oURLs.list(iID),

            fit: true,
            singleSelect: true,

            onClickRow: ((index, oRow) => {
                this.fnFireEvent_ItemClick(oRow);
            }).bind(this),

            onRowContextMenu: ((oEvent, iIndex, oNode) => {
                oEvent.preventDefault();
                this.oContextMenu.menu(
                    'show', 
                    {
                        left: oEvent.pageX,
                        top: oEvent.pageY,
                        onClick: ((item) => {
                            if (item.id == 'edit') {
                                this.fnShowEditWindow(oNode);
                            }
                            if (item.id == 'delete') {
                                this.fnDelete(oNode);
                            }
                        }).bind(this)
                    }
                );
            }).bind(this),
        })
    }

    static fnPrepare()
    {
        this.fnBindEvents();
        this.fnInitComponent();
    }
}