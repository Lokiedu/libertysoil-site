import bookshelf from './utils/bookshelf';

async function updateBookmarkCounters() {
  process.stdout.write("=== RECALCULATING BOOKMARK COUNTERS ===\n");

  await bookshelf.model('User').updateBookmarkCounters();
}

updateBookmarkCounters()
  .then(() => {
    process.stdout.write("=== DONE ===\n");
    process.exit();
  })
  .catch(e => {
    process.stderr.write(e.stack);
    process.exit(1);
  });
