import { createHash } from 'crypto';
import db from '../../database'
import { time } from 'console';


// change the status of the job to 'status'
function changeTheStatus(id, status) {
    console.log("Attempt to change the job_id", id, "to", status)
    const sql = `UPDATE jobs SET job_status = ? WHERE job_id = ? AND job_status <> 'Canceled'`;
    const param = [status, id];

    db.run(sql, param, function (err) {
        if (err) {
            console.log(err)
        }
    })
}

// change the status of the job to Done and update the solve time as well
function changeTheStatusToDone(id, status, solve_time) {
    console.log("Attempt to change the job_id", id, "to", status)
    const sql = `UPDATE jobs SET job_status = ?, solve_time = ? WHERE job_id = ? AND job_status <> 'Canceled'`;
    const param = [status, solve_time, id];
    console.log(id, " is done")
    db.run(sql, param, function (err) {
        if (err) {
            console.log(err)
        }
    })
}

async function insertTheJob(id, time_limit_sec, start_time) {
    return new Promise((resolve, reject) => {
        db.run(`INSERT INTO jobs(job_id, time_limit_sec, job_status, start_time) VALUES(?, ?, ?, ?)`,
            [id, time_limit_sec, 'Waiting', start_time], function (err) {
                if (err) {
                    console.log("error : ", err)
                    reject(err)
                }
                resolve();
            })
    })
}


export default async function handler(req, res) {
    // the req contains this json data
    /**
     * {
     *   "time_limit_sec" : [the limit of time in seconds]
     * }
     */
    if (req.method === 'POST') {
        const { time_limit_sec } = req.body

        // get the current time
        const date = new Date()
        const start_time = date.toISOString()

        // generate a random id 
        const id = Math.random().toString(36) + start_time;
        const hash_id = createHash('sha256').update(id).digest('hex');

        console.log(hash_id)

        const randomTime = async (base) => {
            return new Promise((resolve, reject) => {
                // convert base to number
                base = Number(base)

                const random_time = Math.floor(Math.random() * 2 * base * 0.1) + base * 0.9
                console.log("random time : ", random_time);
                resolve(random_time);
            })
        }

        // // insert the data into the database
        try {
            await insertTheJob(hash_id, time_limit_sec, start_time);
            const random_time1 = await randomTime(5000);
            console.log("start running after ", random_time1)
            setTimeout(changeTheStatus, random_time1, hash_id, 'Running');
            console.log("Time limit sec = ", time_limit_sec)
            const random_time2 = await randomTime(Number(time_limit_sec) * 1000);
            console.log("done after ", random_time2 + random_time1)
            setTimeout(changeTheStatusToDone, random_time2 + random_time1, hash_id, 'Done', random_time2);
            res.status(200).json({ job_id: hash_id });
            return;
        } catch (err) {
            console.log("catch error ", err)
            res.status(500).json({ message: "Internal Server Error" })
            return;
        }

    } else {
        res.status(405).json({ message: "Method Not Allowed" })
        return;
    }
}