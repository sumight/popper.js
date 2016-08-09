import getPopperClientRect from '../utils/getPopperClientRect';
import getOuterSizes from '../utils/getOuterSizes';
import isModifierRequired from '../utils/isModifierRequired';

/**
 * Modifier used to move the arrows on the edge of the popper to make sure them are always between the popper and the reference element
 * It will use the CSS outer size of the arrow element to know how many pixels of conjuction are needed
 * @method
 * @memberof Popper.modifiers
 * @argument {Object} data - The data object generated by update method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
export default function arrow(data, options) {
    let arrow  = options.element;

    // if the arrowElement is a string, suppose it's a CSS selector
    if (typeof arrow === 'string') {
        arrow = data.instance.popper.querySelector(arrow);
    }

    // if arrow element is not found, don't run the modifier
    if (!arrow) {
        return data;
    }

    // the arrow element must be child of its popper
    if (!data.instance.popper.contains(arrow)) {
        console.warn('WARNING: `arrowElement` must be child of its popper element!');
        return data;
    }

    // arrow depends on keepTogether in order to work
    if (!isModifierRequired(data.instance.modifiers, 'arrow', 'keepTogether')) {
        console.warn('WARNING: keepTogether modifier is required by arrow modifier in order to work, be sure to include it before arrow!');
        return data;
    }

    const arrowStyle    = {};
    const placement     = data.placement.split('-')[0];
    const popper        = getPopperClientRect(data.offsets.popper);
    const reference     = data.offsets.reference;
    const isVertical    = ['left', 'right'].indexOf(placement) !== -1;

    const len           = isVertical ? 'height' : 'width';
    const side          = isVertical ? 'top' : 'left';
    const altSide       = isVertical ? 'left' : 'top';
    const opSide        = isVertical ? 'bottom' : 'right';
    const arrowSize     = getOuterSizes(arrow)[len];

    //
    // extends keepTogether behavior making sure the popper and its reference have enough pixels in conjuction
    //

    // top/left side
    if (reference[opSide] - arrowSize < popper[side]) {
        data.offsets.popper[side] -= popper[side] - (reference[opSide] - arrowSize);
    }
    // bottom/right side
    if (reference[side] + arrowSize > popper[opSide]) {
        data.offsets.popper[side] += (reference[side] + arrowSize) - popper[opSide];
    }

    // compute center of the popper
    const center = reference[side] + (reference[len] / 2) - (arrowSize / 2);

    // Compute the sideValue using the updated popper offsets
    let sideValue = center - getPopperClientRect(data.offsets.popper)[side];

    // prevent arrow from being placed not contiguously to its popper
    sideValue = Math.max(Math.min(popper[len] - arrowSize, sideValue), 0);
    arrowStyle[side] = sideValue;
    arrowStyle[altSide] = ''; // make sure to remove any old style from the arrow

    data.offsets.arrow = arrowStyle;
    data.arrowElement = arrow;

    return data;
}