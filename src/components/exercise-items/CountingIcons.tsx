import { Fragment } from 'react'

/** Renders `count` copies of `element`, with an automatic line break every 5. */
export default function CountingIcons({ element, count }: { element: string; count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Fragment key={i}>
          <span className="counting-element">{element}</span> {(i + 1) % 5 === 0 && <br />}
        </Fragment>
      ))}
    </>
  )
}
