var args = arguments[0] || {};

var moment = require('alloy/moment');
var reimburseDetails = Alloy.Collections.reimburseDetail;
var id;

// $model represents the current model accessible to this
// controller from the markup's model-view binding. $model
// will be null if there is no binding in place.

if ($model) {
	id = $model.id;
	$.reimburseDetailRow.rowid = $model.id;
	var status = $model.get('status');
	$.reimburseDetailRow.title = $model.get('name');
	if ($model.get('isDeleted') == 0) {
		//$.reimburseDetailRow.backgroundColor = STATUSCODE_COLOR[status];
		//$.innerView.backgroundColor = 'lightgray';
		$.status.backgroundColor = DETAILSTATUSCODE_COLOR[status];
		//$.avatar.image = '/tick_64.png';
	} else {
		//$.reimburseDetailRow.backgroundColor = status == 0 ? 'red' : 'purple';
		//$.innerView.backgroundColor = 'white';
		$.status.backgroundColor = status == 0 ? 'red' : 'purple';
		//$.avatar.image = '/tick_64.png';
	}
	$.status.visible = status > DETAILSTATUSCODE[Const.Open];
}

// toggle the "done" status of the IDed todo
// function toggleStatus(e) {
	// // find the todo task by id
	// var todo = todos.get(id);
// 
	// // set the current "done" and "date_completed" fields for the model,
	// // then save to presistence, and model-view binding will automatically
	// // reflect this in the tableview
	// todo.set({
		// "done": todo.get('done') ? 0 : 1,
		// "date_completed": moment().unix()
	// }).save();
// }

// delete the IDed todo from the collection
function deleteItem(id) {
	// find the todo task by id
	var reimburseDetail = reimburseDetails.get(id);
	var reimburseId = reimburseDetail.get('reimburseId');

	// destroy the model from persistence, which will in turn remove
	// it from the collection, and model-view binding will automatically
	// reflect this in the tableview
	//reimburseDetail.destroy();
	reimburseDetail.save({isDeleted:1, isSync:0});
	//reimburseDetail.fetch({remove:false});
	reimburseDetails.fetch({remove:false, query:"SELECT * FROM reimburseDetail WHERE isDeleted=0 and reimburseId="+reimburseId});
	
	//--- start of update parent
	var details = reimburseDetails.where({
		isDeleted : 0,
		reimburseId : reimburseId
	});
	
	var first_receipt_original_url = null;
	var first_receipt_mini_url = null;
	var total = 0;
	for (var i in details) {
		if (i == 0) {
			first_receipt_original_url = detail[i].get("first_receipt_original_url");
			first_receipt_mini_url = detail[i].get("first_receipt_mini_url");
		}
		total += parseFloat(details[i].get("amount"));
	}

	var reimburses = Alloy.Collections.reimburse;
	var reimburse = reimburses.get(reimburseId);

	reimburse.set({
		"total" : parseFloat(total),
		first_receipt_original_url : first_receipt_original_url,
		first_receipt_mini_url : first_receipt_mini_url,
	});
	reimburse.save();
	reimburse.fetch({remove: false});
	//--- end of update parent
	
	reimburseDetail = null;
	reimburseDetails = null;
	details = null;
	
	Alloy.Globals.reimburseDetailList.fireEvent("open", {param:{remove:false/*, query:"SELECT * FROM reimburseDetail WHERE reimburseId="+reimburse.id*/}});
}

function doDeleteClick(e){
	if (e.index == 0) {
		// prevent bubbling up to the row
		e.cancelBubble = true;
    	deleteItem(e.source.rowid);
	}
};



function thumbPopUp(e) {
	var aview = Ti.UI.createView({
		width : "256dp",
		height : "256dp",
		backgroundColor : "#7777",
		borderColor : Alloy.Globals.lightColor,
		borderWidth : "1dp",
		touchEnabled: false,
	}); 
	aview.add(Ti.UI.createImageView({
		//width: $.avatar.width > $.avatar.height ? "512dp" : undefined,
		height : "512dp",
		touchEnabled: false,
		image: $.avatar.imageOri,
		autorotate: true,
	}));
	
	Alloy.Globals.dialogView2.removeAllChildren();
	Alloy.Globals.dialogView2.add(aview);
	Alloy.Globals.dialogView2.show();
}

function rowClick(e) {
	id = e.source.parent.rowid;
	Alloy.createController("reimburseDetailForm",{
					id : id , reimburseId : $model.get('reimburseId'), 
					"$model": $model
				}
	).getView().open();
	// Alloy.createController("comment",{
					// id : id
				// }
	// ).getView().open();
}

function rowLongClick(e) {
	id = e.source.parent.rowid;
	
	var deleteDialog = Ti.UI.createAlertDialog({
		title : "Confirm",
		message : "Are you sure you want to delete this record?",
		buttonNames : ["Yes", "No"],
		cancel : 1
	});
	deleteDialog.addEventListener('click', doDeleteClick);

	deleteDialog.rowid = id;
	deleteDialog.show({modal:true});
}


