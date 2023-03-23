import {exec} from "child_process"
import t from "tap"

t.test("Typecheck", (t) => {
  exec("tsc -p test", (err, stdout, stderr) => {
    if (err) {
      t.fail(err.message)
    }
    console.log(stdout, stderr)
    t.passing()
    t.end()
  })
})
