import bookshelf from './utils/bookshelf';


async function updatePostCounters() {
  process.stdout.write("=== RECALCULATING POST COUNTERS ===\n");

  const models = ['Hashtag', 'School', 'Geotag'];

  for (const modelName of models) {
    await bookshelf.model(modelName).updatePostCounters();
  }
}

updatePostCounters()
  .then(() => {
    process.stdout.write("=== DONE ===\n");
    process.exit();
  })
  .catch(e => {
    process.stderr.write(e.stack);
    process.exit(1);
  });
