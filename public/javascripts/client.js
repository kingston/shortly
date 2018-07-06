// Hook up custom file input to show filename when adding

$(() => {
  $('.custom-file input[type=file]').change((event) => {
    if (event.target.files.length > 0) {
      const filename = event.target.files[0].name;
      if (filename) {
        $(event.currentTarget).next('.custom-file-label').text(filename);
      }
    }
  });
});
