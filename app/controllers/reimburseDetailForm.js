var args = arguments[0] || {};
var moment = require('alloy/moment');
Alloy.Globals.cameraShown = false;

function winOpen(e) {
	
}

function doMenuClick(evt) {
  switch(evt.source.title){
		case "Menu": // in real life you probably wouldn't want to use the text of the menu option as your condition
			var activity = $.reimburseDetailForm.getActivity();
			activity.openOptionsMenu();
			break;
		default:
			alert(evt.source.title);	
	}
}


function doSearch(e) {
	alert("Search Clicked");
}

function doSave(e) {
	var reimburses = Alloy.Collections.reimburse;
	var reimburse = Alloy.createModel('reimburse', {
		userId : 1,
		title : $.titleField.value,
		projectDate : moment("YYYY-MM-DD", $.dateField.value).utc().toISOString(),
		total : 0,
		isSent : 0,
		//sentDate : item.sentDate,
		isDeleted : 0,
		status :  0,
	});
	reimburse.save();
	reimburses.add(reimburse);
	// reload the tasks
	reimburses.fetch();
	$.reimburseForm.close();
}

function imageClick(e) {	
	if (!Alloy.Globals.cameraShown) {
		Alloy.Globals.cameraShown = true;
		var camera = require('/lib/camera').getImage(function(media) {
			if (media != null) {
				Ti.API.info("Click Image = " + media.nativePath);
				$.image.image = media.nativePath;
				//media;
			}
			Alloy.Globals.cameraShown = false;
		});
		//cameraShown = false;
	}
}
		
var picker = Ti.UI.createPicker({
	type : Ti.UI.PICKER_TYPE_DATE,
	value : new Date()
});

function dateFieldClick(e) {
	picker.showDatePickerDialog({
		value : moment().toDate(),
		callback : function(e) {
			if (e.cancel) {
			} else {
				$.dateField.value =  moment(e.value).format("YYYY-MM-DD");
			}
		}
	});
}




