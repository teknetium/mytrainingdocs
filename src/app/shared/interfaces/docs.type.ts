export interface DocModel {
  _id: string,
  productName: string,
  productVersion: string,
  intro: string,
  author: string,
  sections: Section[],
  images: string[]
}

export interface Section {
  _id: string,
  title: string,
  intro: string,
  paragraphs: string[],
  images: string[]
}

