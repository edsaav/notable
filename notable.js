Notes = new Meteor.Collection("notes");
Tasks = new Meteor.Collection("tasks");
Companies = new Meteor.Collection("accounts");
Calls = new Meteor.Collection("calls");
Opps = new Meteor.Collection("opps");




if (Meteor.isClient) {
	
	$(function () {
    $('[data-toggle="tooltip"]').tooltip()
  })
	
	$(function () {
    $('[data-toggle="popover"]').popover()
  })
	
	toastr.options = {
    "closeButton": false,
    "debug": false,
    "newestOnTop": false,
    "progressBar": false,
    "positionClass": "toast-bottom-right",
    "preventDuplicates": false,
    "showDuration": "100",
    "hideDuration": "1000",
    "timeOut": "2000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
  }
	
	
	
	//// Body Helpers and Events
	
	Template.body.helpers({
		companyIsSelected: function(){
			if (Session.get("currentAccount")){
				return false
			} else {
				return true
			}
		}		
	});
	
	Template.body.events({
		"click .logout": function(){
			Meteor.logout();
		},
		"click .home": function(){
			Session.set("currentAccount", "");
		}
	});
	
	//// Dashboard
	
	Template.dashboard.helpers({
		allTasks: function(){
			var allTasks = Tasks.find({owner: Meteor.user()._id},{sort: {createdAt: -1}});
			return allTasks;
		},
		isChecked: function(){
			var thisTask = Tasks.find(this._id).fetch();
			console.log(thisTask);
			return thisTask.checked;
		},
		mostRecentNote: function(){
			var recentNote = Notes.find({owner: Meteor.user()._id},{sort: {createdAt: -1}, limit: 1});
			return recentNote;
		},
		quota: function(){
			return 8;
		},
		oppCount: function(){
			return 3;
		},
		quotaPercent: function(){
			var confirmedOpps = Opps.find({oppStatus: "success", owner: Meteor.user()._id}).count();
			return (confirmedOpps/8)*100;
		},
		upcomingOpps: function(){
			var confirmedOpps = Opps.find({oppStatus: "", owner: Meteor.user()._id},{sort: {oppMeetingDate: 1}, limit: 3});
			return confirmedOpps;
		}
	});
	
	Template.dashboard.events({
		"click .toggle-checked": function(){
			Tasks.update(this._id, {$set: {checked: ! this.checked}});
		},
		"click .clearTasks": function(){
			var clickedTasks = Tasks.find({checked: true, owner: Meteor.user()._id}).fetch();
			var x
			for (x in clickedTasks){
				var testValue = clickedTasks[x]._id
				Tasks.remove(testValue);
			};
		},
		"click .goToAccount": function(){
			Session.set("currentAccount", this.forAccount)
		},
		"click .taskEditButton": function(){
			Session.set("currentTask", this._id)
		}
	});
	
	//// New Note Form
	
	Template.entryForm.events({
		"submit .addNote": function(event){
			var title = event.target.noteTitle.value;
			var contents = event.target.noteContents.value;
			Notes.insert({
				title: title,
				contents: contents,
				owner: Meteor.user()._id,
				username: Meteor.user().username,
				forAccount: Session.get("currentAccount"),
				createdAt: new Date()
			});
			event.target.noteTitle.value="";
			event.target.noteContents.value="";
			return false;
		}
	});
	

	
	//// List of Notes
	
	Template.myNotes.helpers({
		notes: function(){
			var allNotes = Notes.find({owner: Meteor.user()._id, forAccount: Session.get("currentAccount")}, {sort: {createdAt: -1}});
			return allNotes;
		},
		currentNoteTitle: function(){
			var currentID = Session.get("currentNote");
			var currentNote = Notes.findOne(currentID);
			return currentNote.title;
		},
		currentNoteBody: function(){
			var currentID = Session.get("currentNote");
			var currentNote = Notes.findOne(currentID);
			return currentNote.contents;
		}
	});
	
	Template.myNotes.events({
		"click .delete": function(){
			var selectedID = this._id;
			Notes.remove(selectedID);
		},
		"click .editNoteButton": function(){
			Session.set("currentNote", this._id);
		},
		"submit .updateNote": function(event){
			var title = event.target.newNoteTitle.value;
			var body = event.target.newNoteContents.value;
			var currentID = Session.get("currentNote");
			Notes.update(currentID, {$set: {title: title, contents: body, createdAt: new Date()}});
			$('#editNoteModal').modal('toggle')
			return false;
		}
	});
	
	//// New Task Form
	
	Template.newTask.events({
		"submit .addTask": function(event){
			var task = event.target.taskBody.value;
			var dueDate = event.target.dueDate.value;
			Tasks.insert({
				taskBody: task,
				taskNotes: "",
				dueDate: dueDate,
				owner: Meteor.user()._id,
				username: Meteor.user().username,
				forAccount: Session.get("currentAccount"),
				createdAt: new Date(),
				checked: false
			});
			event.target.taskBody.value = "";
			return false;
		},
		"click .clearTasks": function(){
			var clickedTasks = Tasks.find({checked: true, owner: Meteor.user()._id, forAccount: Session.get("currentAccount")}).fetch();
			var x
			for (x in clickedTasks){
				var testValue = clickedTasks[x]._id
				Tasks.remove(testValue);
			};
		},
		"click .datePickerButton": function(){
			$('.datepicker').datepicker('show');
		}
	});
	
	Template.newTask.rendered=function() {
    $('#dueDate').datepicker();
  }
	
	
	//// Test Template
	
	Template.tester.rendered=function(){
		$('.textarea').wysihtml5('<p>test</p>');
	}

	
	//// List of Tasks
	
	Template.myTasks.helpers({
		tasks: function(){
			var allTasks = Tasks.find({owner: Meteor.user()._id, forAccount: Session.get("currentAccount")},{sort: {createdAt: -1}});
			return allTasks;
		}
	});
	
	Template.myTasks.events({
		"click .toggle-checked": function(){
			Tasks.update(this._id, {$set: {checked: ! this.checked}});
		},
		"click .taskEditButton": function(){
			Session.set("currentTask", this._id)
		}
	});
	
	//// Accounts Dropdown Widget
	
	Template.accountsWidget.helpers({
		accounts: function(){
			return Companies.find({owner: Meteor.user()._id},{sort: {createdAt: -1}});
		},
		currentAccount: function(){
			var thisAccount = this._id;
			var currentAccount = Session.get("currentAccount");
			if (thisAccount == currentAccount){
				console.log("It's a match: " + thisAccount);
				return true;
			};
		}
	});
	
	Template.accountsWidget.events({
		"click .accountSelect": function(){
			var accountID = this._id;
			Session.set("currentAccount", accountID);
		},
		"click .close": function(){
			var accountID = this._id;
			Session.set("toDelete", accountID);
		}
	});
	
	//// New Account Form
	
	Template.newAccount.events({
		"submit .addAccount": function(event){
			var accountName = event.target.accountName.value;
			Companies.insert({
				accountName: accountName,
				owner: Meteor.user()._id,
				username: Meteor.user().username,
				createdAt: new Date()
			});
			//var accountNew = Companies.find({accountName: accountName}).fetch();
			//console.log(accountNew._id);
			event.target.accountName.value = "";
			//Session.set("currentAccount", accountID);
			toastr.success("Account added successfully!");
			//$('#newAccount').modal('hide');
			$('.modal-backdrop').fadeOut();
			$('#newAccount').hide();
			return false;
		}
	});
	
	//// Delete Company Window
	
	Template.deleteCompany.events({
		"click .deleteCompany": function(){
			var selectedID = Session.get("toDelete");
			var company = Companies.findOne(selectedID);
			var name = company.accountName;
			toastr.success(name + " deleted!");
			Companies.remove(selectedID);			
		}
	});
	
	//// My Calls
	
	Template.myCalls.helpers({
		calls: function(){
			var allCalls = Calls.find({owner: Meteor.user()._id, forAccount: Session.get("currentAccount")},{sort: {createdAt: -1}});
			return allCalls;
		}
	});
	
	Template.myCalls.events({
		"click .delete": function(){
			var selectedID = this._id;
			Calls.remove(selectedID);
		}
	});
	
	//// New Call Form
	
	Template.newCall.events({
		"submit .addCall": function(event){
			var name = event.target.leadName.value;
			var title = event.target.leadTitle.value;
			var type = event.target.callType.value;
			var contents = event.target.callNotes.value;
			var now = new Date();
			Calls.insert({
				leadName: name,
				leadTitle: title,
				callType: type,
				callNotes: contents,
				owner: Meteor.user()._id,
				username: Meteor.user().username,
				forAccount: Session.get("currentAccount"),
				createdAt: new Date(),
				createdAtString: now.toLocaleDateString()
			});
			event.target.leadName.value="";
			event.target.leadTitle.value="";
			event.target.callType.value="";
			event.target.callNotes.value="";
			return false;
		}
	});
	
	//// Main Template
	
	Template.main.helpers({
		currentCompanyName: function(){
			var id = Session.get("currentAccount");
			return Companies.findOne(id).accountName;
		}
	});
	
	//// Settings
	
	Template.settings.events({
		"click .saveSettings": function(){
			Meteor.users.update(Meteor.userId(), {$set: {profile: {testField: "testString"}}});
			console.log(Meteor.user().profile.testField);
		}
	});
	
	//// Edit Task Modal
	
	Template.editTaskWindow.helpers({
		taskBody: function(){
			task = Tasks.findOne(Session.get("currentTask"));
			return task.taskBody;
		},
		taskNotes: function(){
			task = Tasks.findOne(Session.get("currentTask"));
			return task.taskNotes;
		},
		taskDue: function(){
			task = Tasks.findOne(Session.get("currentTask"));
			return task.dueDate;
		}
	});
	
	Template.editTaskWindow.events({
		"click .saveTask": function(){
			content = $('#editTaskBody').val();
			notes = $('#editTaskNotes').text();
			due = $('#thisIsDatePicker').val();
			Tasks.update(Session.get("currentTask"), {$set: {taskBody: content, taskNotes: notes, dueDate: due, createdAt: new Date()}});
		},
		"click .datePickerButton": function(){
			$('.datepicker').datepicker('show');
		}
	})
	
	//// New Opp Window
	
	Template.newOppWindow.helpers({
		myOpps: function(){
			var myOpps = Opps.find({owner: Meteor.user()._id}, {sort: {createdAt: -1}});
			return myOpps;
		}
	});
	
	Template.newOppWindow.events({
		"click .addOpp": function(){
			var oppContact = $('#oppContact').val();
		  var oppCompany = $('#oppCompany').val();
		  var oppManager = $('#oppManager').val();
		  var oppMeetingDate = $('#oppMeetingDate').val();
		  var oppNotes = $('#oppNotes').val();
			Opps.insert({
				oppContact: oppContact,
				oppCompany: oppCompany,
				oppManager: oppManager,
				oppMeetingDate: oppMeetingDate,
				oppNotes: "",
				oppStatus: "",
				owner: Meteor.user()._id,
				username: Meteor.user().username,
				createdAt: new Date(),
			});
			$('#oppContact').val("");
		  $('#oppCompany').val("");
		  $('#oppManager').val("");
		  $('#oppMeetingDate').val("");
		  $('#oppNotes').val("");
			toastr.success("Opportunity added!");
			return false;
		},
		"click .clearOpp": function(){
			$('#oppContact').val("");
		  $('#oppCompany').val("");
		  $('#oppManager').val("");
		  $('#oppMeetingDate').val("");
		  $('#oppNotes').val("");
			return false;
		},
		"click .confirmOpp": function(){
			var opp = this._id;
			Opps.update(opp, {$set: {oppStatus: "success"}});
		},
		"click .loseOpp": function(){
			var opp = this._id;
			Opps.update(opp, {$set: {oppStatus: "danger"}});
		},
		"click .rescheduleOpp": function(){
			var opp = this._id;
			Opps.update(opp, {$set: {oppStatus: "warning"}});
		}
	});
	
	Template.newOppWindow.rendered=function() {
    $('#oppMeetingDate').datepicker();
  }
	
	//// User Accounts Config
	
	Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
	
	
}