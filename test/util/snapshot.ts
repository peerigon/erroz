export const collectSnapshotProps = <Props, Keys extends keyof Props>(
    source: Props,
    keys: Array<Keys>
): {[key in Keys]: Props[Keys]} => {
    const snapshotProps = {} as {[key in Keys]: Props[Keys]};

    for (const key of keys) {
        snapshotProps[key] = source[key];
    }

    return snapshotProps;
};
