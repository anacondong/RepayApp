var args = arguments[0] || {};
var moment = require('alloy/moment');
Alloy.Globals.cameraShown = false;

var reimburseDetails_ass = Alloy.Collections.reimburseDetail_ass;
var comments = $.localComment; //Alloy.Collections.comment; //
//var reimburses = Alloy.Collections.reimburse;

//reimburseDetails && reimburseDetails.fetch({remove: false});

var data;

if (args.id != null) {
	data = reimburseDetails_ass.get(args.id);
}

comments && comments.fetch({remove:false, query:"SELECT * FROM comment WHERE reimburseDetailGid="+args.gid});

function commentFocus(e) {
	$.scrollView.scrollToBottom();
}

function winOpen(e) {
	Alloy.Globals.dialogView3 = $.dialogView3;
	if (data) {
		$.titleField.text = data.get('name');
		$.dateField.text = moment.parseZone(data.get('receiptDate')).local().format(dateFormat);
		$.amountField.text = "Rp." + String.formatDecimal(data.get('amount'));// + " IDR";
		$.descriptionField.text = data.get('description');
		$.photo.image = data.get('urlImageSmall');
		$.photo.imageOri = data.get('urlImageOriginal');
	}
	$.actionTitle.text = "EXPENSE";
	$.commentField.blur();
	Ti.UI.Android.hideSoftKeyboard();
	
	$.act.show();
	remoteReimburseDetail.getDetailObject(args.gid, function(result, retlist) {
		if (result.error) {
			notifBox(result.error);
		} else {
			var list = Alloy.createCollection('comment');
			list.fetch({
				remove : false
			});
			for (var key in retlist) {
				var obj = retlist[key];
				obj.reimburseDetailId = args.id;
				var obj2 = list.find(function(mdl) {
					return mdl.get('gid') == obj.gid;
				});
				//if (!obj2 || obj2.get('lastUpdate') < obj.lastUpdate)					
				{
					if (!obj2) {
						obj2 = Alloy.createModel("comment", obj);
					}
					list.add(obj2, {
						merge : true
					});
					obj2.save();
					//obj2.fetch({remove:false});
				}
			}
			if (comments) {
				//comments.reset();
				comments.fetch({remove:false, query:"SELECT * FROM comment WHERE reimburseDetailGid="+args.gid});
			}
			
		}
		$.act.hide();
	});
}

function winClose(e) {
	if (data) {
		//-- start update parent
		comments && comments.fetch({remove:false, query:"SELECT * FROM comment WHERE reimburseDetailGid="+args.gid});
		var count = comments.length;

		data.set({
			"totalComments" : count,
			//IsSync: 0,
		});
		data.save();
		data.fetch({
			remove : false
		});
		//-- end update parent
		if (args.section) {
			args.dataItem[args.prefix+"commentLabel"].text = count;
			args.section.updateItemAt(args.itemIndex, args.dataItem);
		}
		Alloy.Globals.index.fireEvent("refresh", {param:{remove:false/*, query:"SELECT * FROM reimburse WHERE id="+data.get("reimburseId")*/}});
	}
	$.destroy();
	data = null;
	comments = null;
	reimburseDetails_ass = null;
	//reimburses = null;
}

function doBack(evt) {// 
	Ti.API.info("Home icon clicked!");
	$.comment.fireEvent('android:back', evt);
}

function whereFunction(collection) {
	var ret = collection.where({
		reimburseDetailGid : args.gid
	});
	if (!ret)
		ret = [];
	return ret;
}

function transformFunction(model) {
	var transform = model.toJSON();
	transform.isowner = ((transform.email ? transform.email.trim().toUpperCase() : "") == Alloy.Globals.CURRENT_USER);
	transform.dateCreated = moment.parseZone(transform.dateCreated).local().format("DD-MM-YYYY HH:mm:ss");
	if (transform.isowner) {
		transform.original_avatar_url = (Alloy.Globals.profileImage == null) ? "/icon/ic_action_user.png" : Alloy.Globals.profileImage.image;
		transform.mini_avatar_url = (Alloy.Globals.profileImage == null) ? "/icon/ic_action_user.png" : Alloy.Globals.profileImage.image;
	}
	return transform;
}

function newCommentClick(e) {
	if ($.commentField.value != null && String.format($.commentField.value).trim().length > 0) {
		$.act.show();
		var item = {
			message : $.commentField.value,
			dateCreated : moment().utc().toISOString(),
			//userId : data.get('user_id'),
			username : Alloy.Globals.CURRENT_USER,
			email : Alloy.Globals.CURRENT_USER,
			fullname : Alloy.Globals.CURRENT_NAME,
			reimburseDetailId : args.id,
			reimburseDetailGid : args.gid,
			original_avatar_url : Alloy.Globals.profileImage.image,
			mini_avatar_url : Alloy.Globals.profileImage.image,
		};
		remoteReimburseDetail.addCommentObject(item, function(result) {
			if (!result.error) {
				// merge the result object
				for (var attrname in result) { item[attrname] = result[attrname]; }
				//var isodd = (comments.where({reimburseDetailId : args.id}).length % 2) == 1;
				var comment = Alloy.createModel('comment', item);
				comments.add(comment);
				comment.save();
				// reload the tasks
				//comment.fetch({remove: false});
				$.commentField.value = "";
				
				data.save({totalComments:parseInt(data.get('totalComments'))+1});
				//data.fetch({remove:false});
			} else {
				alert(result.error);
			}
			$.act.hide();
		});
	}
	
	$.commentField.blur();
	Ti.UI.Android.hideSoftKeyboard();
}

function doMenuClick(evt) {
	switch(evt.source.title) {
	case "Menu":
		// in real life you probably wouldn't want to use the text of the menu option as your condition
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

function dialogViewClick(e) {
    $.dialogView3.hide(); //visible = false;
}

function fullClick(e) {
	var view = e.source;
    var img = e.source.children[0];
    view.width = undefined;
    view.height = Ti.UI.FILL;
    img.height = Ti.UI.FILL;
    img.enableZoomControls = true;
}

function thumbPopUp(e) {
	var aview = Ti.UI.createView({
		width : "256dp",
		height : "256dp",
		backgroundColor : "#7777",
		borderColor : Alloy.Globals.lightColor,
		borderWidth : "1dp",
		touchEnabled: true,
		bubbleParent: false,
	}); 
	aview.addEventListener("click", fullClick);
	
	aview.add(Ti.UI.createImageView({
		//width: "512dp",
		height : "512dp",
		touchEnabled: false,
		image: $.photo.imageOri,
		enableZoomControls: false,
	}));
	
	$.dialogView3.removeAllChildren();
	$.dialogView3.add(aview);
	$.dialogView3.show();
}


$.comment.addEventListener("android:back", function(e) {
	if ($.dialogView3.visible) {
		$.dialogView3.hide();
	} else {
		$.comment.close(e);
	}
});
