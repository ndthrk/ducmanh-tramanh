export const quickWishes = [
  { label: 'Trăm năm hạnh phúc', text: 'Chúc hai bạn trăm năm hạnh phúc, mãi yêu thương và bên nhau! ♥' },
  { label: 'Mãi bên nhau', text: 'Chúc hai bạn cùng nắm tay đi qua mọi mùa yêu, hôm nay và mãi về sau! ♥' },
] as const;

export function appendQuickWish(current: string, wish: string) {
  if (current.split('\n').includes(wish)) return current;
  const result = current.trimEnd() ? `${current.trimEnd()}\n${wish}` : wish;
  return result.length <= 1000 ? result : current;
}
