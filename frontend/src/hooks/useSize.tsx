import { useEffect, useState } from "react";


const useSize = (ref:  React.MutableRefObject<null>): [number, number] => {
    const [width, setWidth] = useState<number>(0)
    const [height, setHeight] = useState<number>(0)

    useEffect( () => {

        if( ref.current === undefined ) return;

        const updateSize = () => {
            const { width, height } = (ref.current as any).getBoundingClientRect()
            setWidth(width)
            setHeight(height)
        }

        updateSize()

        window.addEventListener('resize', updateSize)
        return () => window.removeEventListener('resize', updateSize)
    }, [ref])

    return [width, height]
}

export default useSize;