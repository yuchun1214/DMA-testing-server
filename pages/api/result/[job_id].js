import db from '../../../database'

async function getTheStatusOfJob(id){
    return new Promise((resolve, reject) => {
        db.get(`SELECT job_status, solve_time FROM jobs WHERE job_id = ?`, [id], (err, row) => {
            if(err){
                reject(err)
            }
            resolve(row)
        })
    })
}

export default async function hander(req, res){
    if(req.method === 'GET'){
        const { job_id } = req.query

        return getTheStatusOfJob(job_id).then((row) => {
            if(row){
                if(row.job_status === 'Done'){
                    res.status(200).json({
                        status : row.job_status,
                        qubo_solution : {
                            timing: {
                                solve_time: row.solve_time
                            }
                        }
                    })
                    return;
                }else{
                    res.status(200).json({
                        status : row.job_status,
                    })
                    return;
                }
            }else{
                res.status(404).json({message: `job_id ${job_id} IS Not Found`})
                return;
            }
        }).catch((err) => {
            console.log(err)
            res.status(500).json({message: "Internal Server Error"})
        })
        return;
    }else if (req.method === 'DELETE'){
        const { job_id } = req.query
        // check if the alive field is true, if it set it to be false
        const sql = `SELECT job_status FROM jobs WHERE job_id = ?`
        try{
            new Promise((resolve, reject) => {
                db.get(sql, [job_id], (err, row) => {
                    if(err){
                        console.log(err)
                        reject(err)
                    }
                    resolve(row.job_status)
                })
            }).then((status) => {
                console.log('status : ', status)
                if(status === 'Deleted'){
                    res.status(400).json({message: `job is already deleted`})
                }else if(status === 'Waiting' || status === 'Running'){
                    res.status(200).json({
                        message : 'Job is not done',
                        status : status
                    })
                }else{
                    db.run(`UPDATE jobs SET job_status = 'Deleted', alive='false' WHERE job_id = ?`, [job_id], (err) => {
                        if(err){
                            console.log(err)
                            res.status(500).json({message: "Internal Server Error"})
                        }
                        res.status(200).json({
                            message : 'Job is deleted',
                            status : 'Deleted'
                        })
                    })
                }
            })
            return;
        }catch(err){
            console.log(err)
            res.status(500).json({message: "Internal Server Error"})
        }
        
        return;
    }
}