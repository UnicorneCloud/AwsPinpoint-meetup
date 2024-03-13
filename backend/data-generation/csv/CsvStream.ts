import fs from 'fs'

export class CsvStream {
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

    fs.writeFileSync(`${path}.csv`, content, { encoding: 'utf-8' });
  }

  read<T extends object>(content: string): T[] {
    const lines = content.split('\n')
    const keys = lines[0].split(',')
    const data = lines.slice(1).map(line => {
      const values = line.split(',')
      const item: any = {}
      keys.forEach((key, index) => {
        item[key] = values[index]
      })
      return item
    })
    return data
  }
}