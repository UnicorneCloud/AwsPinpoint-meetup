import fs from 'fs'

export class CsvWriter {
  write<T extends object>(data: T[], path: string): void {
    const type = data[0]
    const keys = Object.keys(type) as (keyof T)[]
    let content = ''
    const headers = `${keys.join(',')}\n`
    content += headers

    data.forEach(item => {
      let row = ''
      keys.forEach(key => {
        row += item[key] + ','
      })
      row = row.substring(0, row.length - 1);
      row += '\n'
      content += row
    })

    fs.writeFileSync(`${path}.csv`, content);
  }
}