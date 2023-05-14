import db from '../../database'

export default async function handler(req, res) {
    if(req.method === 'GET'){
        // return job status list
        const sql = `SELECT job_id, job_status, start_time FROM jobs WHERE alive = true`
        return new Promise((resolve, reject) => {
            db.all(sql, [], (err, rows) => {
                if(err){
                    console.log(err)
                    reject(err);
                }else{
                    res.status(200).json({"job_status_list": rows})
                    resolve();
                }
            })
        }).catch((err) => {
            console.log(err)
            res.status(500).json({message: "Internal Server Error"})
        })
    }else{
        res.status(405).json({message: "Method Not Allowed"})
        return;
    }
}