/* One italic word per heading: the last word of a step's or value's
   title. Shared by the home craft film and the story page's process
   chapter; the values ledger inks its titles through InkWords, whose
   `emLast` keeps the same rule. */
export function StepTitle({ title }: { title: string }) {
  const cut = title.lastIndexOf(" ");
  if (cut < 0) return <em>{title}</em>;
  return (
    <>
      {title.slice(0, cut + 1)}
      <em>{title.slice(cut + 1)}</em>
    </>
  );
}
