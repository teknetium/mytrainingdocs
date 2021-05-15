export interface WatchListModel {
  _id: string,
  type: string,
  listName: string,
  items: string[],
  createDate: number,
  ownerId: string,
}
