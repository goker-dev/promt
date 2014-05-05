/* forma 1.1.0 */
(function($){
    // Methods
    var methods = {
        init      : function(element, options){
            $this = this;
            //console.log('init forma', $this);
            // Bind options
            var forma =  $.extend(element, options);
            forma.init(forma);

            // FILE
            if(forma.fileupload)
                forma.find('input[type=file][class!=droparea]')
                .each(function(){
                    var area = $('<p class="file">')
                    .insertAfter($(this)).append($(this));

                    $('<b>').html($(this).attr('title')).prependTo(area);
                    $('<b class="info">').prependTo(area);
                    $('<b class="progress">').prependTo(area);

                    $(this).change(function(e){
                        area.maxsize = forma.maxsize;
                        area.counter = 0;
                        $this.traverse(e.target.files, $(this), area);
                    });
                });

            // SUBMIT
            if(forma.ajaxpost)
                forma.on('submit', function(e){
                    e.preventDefault();
                    
                    //console.log('submit forma', $this);
                    $this.start(forma);
                    forma.find('i.error, i.success').fadeOut();
                    forma.find('.error').removeClass('error');
                    forma.find('input[type=submit]').attr('disabled','disabled');
                    forma.find('.loader').css('display','inline-block');

                    if(forma.postunchecked)
                        $('input[type=checkbox]:not(:checked)').each(function(){
                            forma.append($('<input>',{
                                type:'hidden',
                                name:$(this).attr('name')
                            }));
                        });
                    $.ajax({
                        url: forma.prefix + forma.attr('action') + forma.suffix,
                        type: forma.attr('method'),
                        data: forma.serialize() + '&' + forma.data + '&' + $(forma).data('data'),
                        dataType: forma.dataType,
                        success: function(r){
                            forma.result = r;
                            $this.complete(forma);
                        },
                        error: function(r){
                            forma.result = r;
                            $this.complete(forma);
                        }
                    });
                });
            return $(this);
        },
        traverse  : function(files, input, area){
            $this = this;
            area.files = files.length;
            if (typeof files !== "undefined") {
                for (var i = 0, l = area.files; i < l; i++) {
                    $this.control(files[i], input, area);
                }
            } else {
                alert('un supported file!');
            }
        },
        control   : function(file, input, area){
            $this = this;
            var item = $('<u class="attachment">').html(file.name)
            .insertAfter(area);
            // File type control
            var tld = file.name.toLowerCase().split(/\./);
            tld = tld[tld.length -1];
            //console.log(input.data('type').indexOf(tld),tld,input.data('type'));
            if (input.data('type') && input.data('type').indexOf(tld) < 0) {
                $('<i class="error">')
                .html('error, you can upload only "' + input.data('type') + '" files.')
                .insertAfter(item);
                return 0;
            }
            // File size control
            if (file.size > (area.maxsize * 1048576)) {
                $('<i class="error">')
                .html('error, max upload size: ' + area.maxsize + 'Mb')
                .insertAfter(item);
                return 0;
            }
            $this.upload(file, input, area);
        },
        upload    : function(file, input, area){
            $this = this;
            area.find('[class=info]').html((++area.counter)+'/'+area.files)
            //area.empty();

            // Uploading - for Firefox, Google Chrome and Safari
            var xhr = new XMLHttpRequest();
            // Update progress bar
            var progress = area.find('[class=progress]');
            xhr.upload.addEventListener("progress", function (e) {
                if (e.lengthComputable) {
                    var loaded = Math.ceil((e.loaded / e.total) * 100) + "%";
                    progress.css('width',loaded);
                }
            }, false);

            // File uploaded
            xhr.addEventListener("load", function (e) {
                progress.css('width',0);
                // Custom forma object for complete function
                var forma = {
                    result : jQuery.parseJSON(e.target.responseText),
                    file   : file,
                    input  : input,
                    area   : area
                };
                // Calling upload's complete function
                eval(input.data('complete'));
            }, false);
            xhr.open("post", input.data('post'), true);
            xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");

            // Create a new formadata
            var fd = new FormData();

            // Add optional forma data
            for (var i in input.data())
                if (typeof input.data(i) !== "object")
                    fd.append(i, input.data(i));

            // Add file data
            fd.append(input.attr('name'), file);

            // Send data
            xhr.send(fd);
        },
        start     : function(forma){
            forma.start(forma);
            return;
        },
        complete  : function(forma){
            $this = this;
            forma.complete(forma);

            forma.find('input[type=submit]').removeAttr('disabled');
            forma.find('.loader').css('display','none');

            if(forma.result.fields){
                var f = typeof forma.result.fields === 'object' ? forma.result.fields : forma.result.fields.split(/,/);
                for(var i in f){
                    forma.find('[name='+f[i]+']').addClass('error');
                }
            }
            // clear results
            forma.find('i.error, i.success').remove();

            if(forma.result.message) 
                forma.find('label:has(input[type=submit])')
                .before($('<i class="'+(forma.result.code != 200 ? 'error' : 'success')+'">')
                        .html(forma.result.message));

            if(forma.result.redirect) location.href = forma.result.redirect;
            var results = forma.result;
            eval($(forma).data('complete'));

            return;
        },
        error     : function(forma){
            forma.error(forma);
            return;
        },
        options   : function(forma){
            //console.log(forma);
            return;
        }
    };
    $.fn.forma = function(options) {
        options = $.extend({
            init         : function(){},
            start        : function(){},
            complete     : function(){},
            error        : function(){},
            ajaxpost     : 1,
            fileupload   : 1,
            postunchecked: 1,
            prefix       : '',
            suffix       : '',
            dataType     : 'json',
            data         : 'js=1',
            maxsize      : 10 //Mb
        }, options);
        //this.each(function(){
        return    methods.init($(this), options);
        //});
        //return $(this);
    };
})(jQuery);

$('form.ajax').forma({'ajaxpost':1, 'fileupload':1, 'postunchecked':1, 'complete': (complete ? complete : function(){})});





