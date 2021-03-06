<?php 

include_once("./database.php");

?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title></title>

    <link rel="shortcut icon" href="<?php echo $sBase ?>/static/app/favicon.png" type="image/png">

    <link rel="stylesheet" type="text/css" href="<?php echo $sB ?>/themes/default/easyui.css">
    <link rel="stylesheet" type="text/css" href="<?php echo $sB ?>/themes/icon.css">
    <link rel="stylesheet" type="text/css" href="<?php echo $sBA ?>/styles_index.css">
    <script type="text/javascript" src="<?php echo $sB ?>/jquery.min.js"></script>
    <script type="text/javascript" src="<?php echo $sB ?>/jquery.easyui.min.js"></script>

    <link rel="stylesheet" type="text/css" href="<?php echo $sBA ?>/easymde.min.css">
    <script type="text/javascript" src="<?php echo $sBA ?>/easymde.min.js"></script>
    <script type="text/javascript" src="<?php echo $sBA ?>/all.js"></script>
    <script type="text/javascript" src="<?php echo $sBA ?>/speadsheet.js"></script>

    <script src="https://cdn.jsdelivr.net/highlight.js/latest/highlight.min.js"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/highlight.js/latest/styles/github.min.css">
</head>
<body>
    <div id="main-panel">
        <?php include "includes/layout.php" ?>
        <?php include "includes/components.php" ?>
    </div>
</body>
</html>

<script type="module">
import * as m from "./static/app/modules/__init__.js";

$(document).ready(() => {
    m.LeftTabs.fnPrepare();
    m.RightTabs.fnPrepare();
    m.Notes.fnPrepare();
    m.CategoriesNotes.fnPrepare();
    m.LastNotes.fnPrepare();
    m.FavNotes.fnPrepare();
    m.Links.fnPrepare();
    m.RandomNotes.fnPrepare();
    m.Tables.fnPrepare();
    m.TablesCategories.fnPrepare();
    m.Tags.fnPrepare();
    m.Tasks.fnPrepare();
    m.Files.fnPrepare();
    m.SearchList.fnPrepare();
})
</script>