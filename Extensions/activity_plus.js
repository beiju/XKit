//* TITLE Activity+ **//
//* VERSION 0.2 REV C **//
//* DESCRIPTION Tweaks for the Activity page **//
//* DETAILS This extension brings a couple of tweaks for the Activity page, such as the ability to filter notes by type and showing timestamps. **//
//* DEVELOPER STUDIOXENIX **//
//* FRAME false **//
//* BETA false **//

XKit.extensions.activity_plus = new Object({

	running: false,
	
	preferences: {
		sep0: {
			text: "Notes view",
			type: "separator"	
		},
		notes_filter: {
			text: "Enable Filter Notes By Type",
			default: true,
			value: true,
			experimental: true
		},
		show_timestamps: {
			text: "Show timestamps on Notes",
			default: true,
			value: true
		},
		sep1: {
			text: "Graphs view",
			type: "separator"	
		},
		hide_graphs: {
			text: "Hide the graphs (notes, new followers, etc.)",
			default: false,
			value: false
		},
		sep2: {
			text: "Navigation",
			type: "separator"	
		},
		quick_switch: {
			text: "When I switch my blog on the sidebar, go to the Activity page of that blog",
			default: false,
			value: false
		}
	},
	
	new_note_check_interval: 0,

	run: function() {
		
		this.running = true;
		if (!XKit.interface.where().activity) { return; }
		
		XKit.tools.init_css("activity_plus");
		var m_css = "";
		
		if (this.preferences.hide_graphs.value === true) {
			m_css = m_css + " #user_graphs, .ui_stats { display: none; }";
		}
		
		if (this.preferences.show_timestamps.value === true) {
			// m_css = m_css + " .part_activity { left: 95px !important; } .ui_note .part_avatar { left: 57px !important; } .part_response { padding-left: 95px !important; }";
			new_note_check_interval = setInterval(XKit.extensions.activity_plus.do_on_new, 3000);
		}
		
		if (this.preferences.notes_filter.value === true) {
			var m_html = "<div id=\"xkit-activity-plus-note-filter\">" +
						"<div data-type=\"\" class=\"xkit-note-filter-all selected\">all</div>" +
						"<div data-type=\"is_reblog\" class=\"xkit-note-filter-reblog\">reblogs</div>" +
						"<div data-type=\"is_like\" class=\"xkit-note-filter-like\">likes</div>" +
						"<div data-type=\"is_reply\" class=\"xkit-note-filter-reply\">replies</div>" +
						"<div data-type=\"is_follower\" class=\"xkit-note-filter-follow\">follows</div>" +
						"<div data-type=\"from_mutual\" class=\"xkit-note-filter-from-mutual\">from mutual</div>" +
					"</div>";
			$(".ui_notes_switcher").append(m_html);
			
			$("#xkit-activity-plus-note-filter div").bind("click", function() {
			
				var m_type = $(this).attr('data-type');
				
				$("#xkit-activity-plus-note-filter div").not(this).removeClass("selected");
				$(this).addClass("selected");
				
				if (m_type === "from_mutual") {
					
					XKit.tools.add_css(".ui_note { display: none; } .ui_note.is_friend { display: block }", "activity_plus_note_filter_mutual");
					return;
				
				}
				
				XKit.tools.remove_css("activity_plus_note_filter_mutual");
				XKit.tools.remove_css("activity_plus_note_filter");
				
				if (m_type === "") {
					if ($(".ui_note").length >= 350) {
						$('html, body').animate({
    							scrollTop: 30
 						}, 600);
 						$( ".ui_note:gt(200)" ).remove();	
					}
					return;		
				}
				
				if (m_type === "is_reply") {
					m_type = "is_reply, .is_answer";	
				}
				
				var m_filter_css = ".ui_note { display: none; } .ui_note." + m_type + " { display: block; }";
				XKit.tools.add_css(m_filter_css, "activity_plus_note_filter");
				
			});
			
			$(window).scroll(function () {
				if ($(".ui_sticky").hasClass("is_sticky")) {
					$("#xkit-activity-plus-note-filter").addClass("center-me-up");	
				} else {
					$("#xkit-activity-plus-note-filter").removeClass("center-me-up");	
				}
			});
			
		}
		
		if (this.preferences.quick_switch.value === true) {
		
			$("#popover_blogs").find(".blog_title").each(function() {
				$(this).attr('href', $(this).attr('href').replace('/blog/', '/activity/'));
			});	
			
		}
		
		XKit.tools.add_css(m_css, "activity_plus_additional");
		XKit.extensions.activity_plus.do_on_new();
		
		
	},
	
	do_on_new: function() {
		
		if (XKit.extensions.activity_plus.preferences.show_timestamps.value === true) {
			XKit.extensions.activity_plus.do_timestamps();	
		}
		
	},
	
	do_timestamps: function() {
		
		$(".ui_note").not(".xkit-activity-plus-timestamps-done").each(function() {
			
			$(this).addClass("xkit-activity-plus-timestamps-done");
			
			var m_timestamp = $(this).attr('data-timestamp');
			var dtx = new Date(m_timestamp * 1000);
			var dt = moment(dtx);
			var m_date = dt.format("hh:mm:ss a");
			
			var nowdate = new Date();
			var nowdatem = moment(nowdate);
			var m_relative_time = dt.from(nowdatem);
			
			var m_html = "<div class=\"xkit-activity-plus-timestamp\">" + m_date + " &middot; " + m_relative_time + "</div>";
			
			$(this).append(m_html);
			
		});	
		
	},
	
	cpanel: function() {
	
		$("#xkit-timestamps-format-help").click(function() {
			XKit.window.show("Timestamp formatting","This extension allows you to format the date by using a formatting syntax. Make your own and type it in the Timestamp Format box to customize your timestamps.<br/><br/>For information, please visit:<br/><a href=\"http://xkit.info/seven/support/timestamps/index.php\">Timestamp Format Documentation</a><br/><br/>Please be careful while customizing the format. Improper/invalid formatting can render Timestamps unusable. In that case, just delete the text you've entered completely and XKit will revert to its default formatting.","info","<div class=\"xkit-button default\" id=\"xkit-close-message\">OK</div>");
		});	
		
	},

	destroy: function() {
		this.running = false;
		XKit.tools.remove_css("activity_plus_note_filter_mutual");
		XKit.tools.remove_css("activity_plus");
		XKit.tools.remove_css("activity_plus_additional");
		$(".ui_note").removeClass("xkit-activity-plus-timestamps-done");
		$(".xkit-activity-plus-timestamp").remove();
		$("#popover_blogs").find(".blog_title").each(function() {
			$(this).attr('href', $(this).attr('href').replace('/activity/', '/blog/'));
		});	
	}

});