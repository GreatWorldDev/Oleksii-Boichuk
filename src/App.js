import { useState } from 'react'
import Papa from 'papaparse'

const allowedExtensions = ['csv']

const App = () => {
  const [data, setData] = useState([])
  const [result, setResult] = useState([])
  const [error, setError] = useState('Please input file.')
  const [file, setFile] = useState('')
  const handleFileChange = (e) => {
    setError('')

    if (e.target.files.length) {
      const inputFile = e.target.files[0]

      const fileExtension = inputFile?.type.split('/')[1]
      if (!allowedExtensions.includes(fileExtension)) {
        setError('Please input a csv file')
        return
      }

      if (!inputFile) return setError('Enter a valid file')

      const reader = new FileReader()

      reader.onload = async ({ target }) => {
        const csv = Papa.parse(target.result)
        const parsedData = csv?.data
        setData(parsedData)
        let list = {}
        parsedData.forEach((item) => {
          const data = {
            empId: item[0].trim(),
            projectId: item[1].trim(),
            startDate: new Date(item[2].trim()),
            endDate:
              item[3].trim() === 'NULL' ? Date.now() : new Date(item[3].trim()),
          }
          if (!list[data.projectId]) {
            list[data.projectId] = []
          }
          list[data.projectId].push(data)
        })

        let common = []
        Object.values(list).forEach((datas) => {
          let res = {},
            max = 0
          for (let i = 0; i < datas.length; i++) {
            for (let j = i + 1; j < datas.length; j++) {
              let duration =
                Math.min(datas[i].endDate, datas[j].endDate) -
                Math.max(datas[i].startDate, datas[j].startDate)
              if (duration > max) {
                max = duration
                res = {
                  employeeId1: datas[i].empId,
                  employeeId2: datas[j].empId,
                  projectId: datas[i].projectId,
                  days: Math.ceil(duration / 24 / 3600000),
                }
              }
            }
          }
          if (Object.keys(res).length !== 0) common.push(res)
        })
        setResult(common)
      }

      reader.readAsText(inputFile)
    }
  }

  return (
    <div>
      <div className='file-input-group'>
        <label htmlFor='csvInput'>Enter CSV File</label>
        <input
          onChange={handleFileChange}
          id='csvInput'
          class='custom-file-input'
          name='file'
          type='File'
        />
      </div>
      {error ? (
        <h1>{error}</h1>
      ) : (
        <>
          <h1>Data</h1>
          <table className='common-project'>
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Project ID</th>
                <th>Start Date</th>
                <th>End Date</th>
              </tr>
            </thead>
            <tbody>
              {data.map((res, index) => (
                <tr key={`common-${index}`}>
                  <td>{res[0]}</td>
                  <td>{res[1]}</td>
                  <td>{res[2]}</td>
                  <td>{res[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {result ? (
            <>
              <h1>Common projects for longest period</h1>
              <table className='common-project'>
                <thead>
                  <tr>
                    <th>Employee ID #1</th>
                    <th>Employee ID #2</th>
                    <th>Project ID</th>
                    <th>Days worked</th>
                  </tr>
                </thead>
                <tbody>
                  {result.map((res, index) => (
                    <tr key={`common-${index}`}>
                      <td>{res.employeeId1}</td>
                      <td>{res.employeeId2}</td>
                      <td>{res.projectId}</td>
                      <td>{res.days}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : null}
        </>
      )}
    </div>
  )
}

export default App
